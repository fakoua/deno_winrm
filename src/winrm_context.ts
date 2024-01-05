import { parse } from "https://deno.land/x/xml@2.1.3/mod.ts";
import { document, node } from "https://deno.land/x/xml@2.1.3/utils/types.ts";
import {
  BasicAuthentication,
  CommandResponse,
  constractHost,
  HttpResponse,
  WinRMHost,
} from "./common.ts";
import {
  message_command,
  message_commandid,
  message_delete_shellid,
  message_shellid,
} from "./soap_messages.ts";
import { SoapClient } from "./soap_client.ts";
import { decodeBase64 } from "https://deno.land/std@0.210.0/encoding/base64.ts";

export class WinRMContext {
  private winrmServer: string;

  constructor(
    private auth: BasicAuthentication,
    private host: WinRMHost | string,
  ) {
    this.winrmServer = constractHost(this.host);
  }

  public async runCommand(command: string): Promise<CommandResponse> {
    const messageId = this.getUUID();

    const shellId = await this.getShellId(messageId);
    if (!shellId.success) {
      return shellId;
    }

    const commandId = await this.getCommandId(
      command,
      messageId,
      shellId.message,
    );

    if (!commandId.success) {
      return commandId;
    }

    const commandResponse = await this.getCommand(
      messageId,
      shellId.message,
      commandId.message,
    );

    const deleteResponse = await this.deleteShellId(messageId, shellId.message);
    if (!deleteResponse.success) {
      return deleteResponse;
    }
    return commandResponse;
  }

  private async deleteShellId(
    messageId: string,
    shellId: string,
  ): Promise<CommandResponse> {
    const soapIn = message_delete_shellid(this.winrmServer, messageId, shellId);

    const soapClient = new SoapClient(this.auth, this.host);
    const res = await soapClient.httpRequest(soapIn);

    if (res.status === 200) {
      return { success: true, message: "" };
    } else {
      return this.processError(res);
    }
  }

  private async getCommand(
    messageId: string,
    shellId: string,
    commandId: string,
  ): Promise<CommandResponse> {
    const soapIn = message_command(
      this.winrmServer,
      messageId,
      shellId,
      commandId,
    );

    const soapClient = new SoapClient(this.auth, this.host);
    const res = await soapClient.httpRequest(soapIn);

    if (res.status === 200) {
      const xmlDoc = parse(res.body);
      const receiveResponseDocument =
        ((xmlDoc["s:Envelope"] as document)["s:Body"] as document)[
          "rsp:ReceiveResponse"
        ] as document;

      const streams = receiveResponseDocument["rsp:Stream"];

      const s = streams as node;
      let strBuilder = "";
      for (const key in s) {
        const cmd = (s[key] as document)["#text"]?.toString();
        if (cmd !== undefined) {
          strBuilder = `${strBuilder}\r\n${
            new TextDecoder().decode(decodeBase64(cmd))
          }`;
        }
      }
      return {
        message: strBuilder,
        success: true,
      };
    } else {
      return this.processError(res);
    }
  }

  private async getCommandId(
    command: string,
    messageId: string,
    shellId: string,
  ): Promise<CommandResponse> {
    const soapIn = message_commandid(
      this.winrmServer,
      messageId,
      shellId,
      command,
    );
    const soapClient = new SoapClient(this.auth, this.host);
    const res = await soapClient.httpRequest(soapIn);

    if (res.status === 200) {
      const xmlDoc = parse(res.body);
      const commandId =
        (((xmlDoc["s:Envelope"] as document)["s:Body"] as document)[
          "rsp:CommandResponse"
        ] as document)["rsp:CommandId"];

      return {
        success: true,
        message: commandId ? commandId.toString() : "",
      };
    } else {
      return this.processError(res);
    }
  }

  private async getShellId(messageId: string): Promise<CommandResponse> {
    const soapIn = message_shellid(this.winrmServer, messageId);
    const soapClient = new SoapClient(this.auth, this.host);
    const res = await soapClient.httpRequest(soapIn);
    if (res.status === 200) {
      const xmlDoc = parse(res.body);
      const shellId =
        (((xmlDoc["s:Envelope"] as document)["s:Body"] as document)[
          "rsp:Shell"
        ] as document)["rsp:ShellId"];

      return {
        success: true,
        message: shellId ? shellId.toString() : "",
      };
    } else {
      return this.processError(res);
    }
  }

  //Private functions:

  private processError(res: HttpResponse): CommandResponse {
    const er = this.parseSoapError(res.body);
    if (er.error !== undefined) {
      return er;
    } else {
      const body = res.body.length == 0 ? "" : ` - ${res.body}`;
      return {
        success: false,
        message: "",
        error: {
          message: `${res.status} ${res.statusText}${body}`,
        },
      };
    }
  }

  private parseSoapError(soap: string): CommandResponse {
    try {
      const xmlDoc = parse(soap);
      const bodyDoc =
        ((xmlDoc as document)["s:Envelope"] as document)["s:Body"] as document;

      const reason =
        (((bodyDoc["s:Fault"] as document)["s:Reason"] as document)[
          "s:Text"
        ] as document)["#text"]?.toString();
      const message =
        (((bodyDoc["s:Fault"] as document)["s:Detail"] as document)[
          "f:WSManFault"
        ] as document)["f:Message"]?.toString();
      const rtnVal: CommandResponse = {
        success: false,
        message: "",
        error: {
          message: message,
          reason: reason,
        },
      };
      return rtnVal;
    } catch (_) {
      return {
        success: false,
        message: "",
      };
    }
  }

  private getUUID(): string {
    return crypto.randomUUID();
  }
}
