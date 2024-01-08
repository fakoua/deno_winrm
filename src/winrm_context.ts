import * as log from "https://deno.land/std@0.211.0/log/mod.ts";
import { parse } from "https://deno.land/x/xml@2.1.3/mod.ts";
import { document, node } from "https://deno.land/x/xml@2.1.3/utils/types.ts";
import {
  anyany,
  BasicAuthentication,
  CommandResponse,
  constructHost,
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
import { decodeBase64 } from "https://deno.land/std@0.211.0/encoding/base64.ts";

/**
 * WinRM Class
 * @date 1/7/2024 - 7:21:05 PM
 *
 * @export
 * @class WinRMContext
 * @typedef {WinRMContext}
 */
export class WinRMContext {
  private winrmServer: string;
  private contextMessageId: string | undefined;
  private contextShellId: string | undefined;

  /**
   * Creates an instance of WinRMContext.
   * @date 1/7/2024 - 7:21:26 PM
   *
   * @constructor
   * @param {BasicAuthentication} auth - Authentication
   * @param {(WinRMHost | string)} host - WinRM server
   */
  constructor(
    private auth: BasicAuthentication,
    private host: WinRMHost | string,
  ) {
    this.winrmServer = constructHost(this.host);
    this.contextMessageId = undefined;
    this.contextShellId = undefined;
  }

  /**
   * Run windows command
   * @date 1/7/2024 - 7:17:13 PM
   * @author Sameh Fakoua <s.fakoua@gmail.com>
   *
   * @public
   * @async
   * @param {string} command - window command
   * @description The runCommand automatically create and destroy a shellId, do not use runCommand with openShell/closeShell
   * @example
   * ```ts
   * import * as winrm from "https://deno.land/x/deno_winrm/mod.ts";
   * const context = new winrm.WinRMContext({
   *   username: "my_user",
   *   password: "my_password",
   * }, "machine_name_or_ip");
   *
   * const result = await context.runCommand("ipconfig /all");
   *
   * if (result.success) {
   *   console.log(result.message);
   * } else {
   *   console.log(result.error?.message);
   * }
   * ```
   * @returns {Promise<CommandResponse>}
   */
  public async runCommand(command: string): Promise<CommandResponse> {
    let messageId: string;
    let shellId: string;

    if (this.isContextMode()) {
      messageId = this.contextMessageId!;
      shellId = this.contextShellId!;
    } else {
      messageId = this.getUUID();
      const shellIdResult = await this.getShellId(messageId);
      if (!shellIdResult.success) {
        return shellIdResult;
      } else {
        shellId = shellIdResult.message;
      }
    }

    const commandId = await this.getCommandId(
      command,
      messageId,
      shellId,
    );

    if (!commandId.success) {
      return commandId;
    }

    const commandResponse = await this.getCommand(
      messageId,
      shellId,
      commandId.message,
    );

    if (!this.isContextMode()) {
      const deleteResponse = await this.deleteShellId(messageId, shellId);
      if (!deleteResponse.success) {
        return deleteResponse;
      }
    }

    return commandResponse;
  }

  public async openShell(): Promise<boolean> {
    if (
      this.contextMessageId !== undefined || this.contextShellId !== undefined
    ) {
      throw new Error("There is an open shell, make sure you close the shell.");
    }

    this.contextMessageId = this.getUUID();

    const shellId = await this.getShellId(this.contextMessageId);
    if (shellId.success) {
      this.contextShellId = shellId.message;
      return true;
    }

    log.error(
      `Unable to open a shell: ${shellId.error?.reason} - ${shellId.error?.message}`,
    );
    return false;
  }

  public async closeShell(): Promise<boolean> {
    if (
      this.contextMessageId === undefined || this.contextShellId === undefined
    ) {
      throw new Error("There is no open shell");
    }

    const res = await this.deleteShellId(
      this.contextMessageId,
      this.contextShellId,
    );

    if (res.success) {
      this.contextMessageId = undefined;
      this.contextShellId = undefined;
      return true;
    }

    log.error(
      `Error while closing the shell: ${res.error?.reason} - ${res.error?.message} `,
    );
    return false;
  }

  //Private functions

  private isContextMode(): boolean {
    return this.contextMessageId !== undefined &&
      this.contextShellId !== undefined;
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
      const xmlDoc = parse(res.body) as anyany;

      const rResponseDocument =
        xmlDoc["s:Envelope"]["s:Body"]["rsp:ReceiveResponse"];

      const streams = rResponseDocument["rsp:Stream"] as node;

      let strBuilder = "";
      for (const key in streams) {
        const cmd = (streams[key] as document)["#text"]?.toString();
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
      const xmlDoc = parse(res.body) as anyany;
      const commandId =
        xmlDoc["s:Envelope"]["s:Body"]["rsp:CommandResponse"]["rsp:CommandId"];
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
      const xmlDoc = parse(res.body) as anyany;
      const shellId =
        xmlDoc["s:Envelope"]["s:Body"]["rsp:Shell"]["rsp:ShellId"];
      return {
        success: true,
        message: shellId ? shellId.toString() : "",
      };
    } else {
      return this.processError(res);
    }
  }

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
      const xmlDoc = parse(soap) as anyany;
      const bodyDoc = xmlDoc["s:Envelope"]["s:Body"];
      const reason = bodyDoc["s:Fault"]["s:Reason"]["s:Text"]["#text"]
        ?.toString();
      const message =
        bodyDoc["s:Fault"]["s:Detail"]["f:WSManFault"]["f:Message"]?.toString();
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
