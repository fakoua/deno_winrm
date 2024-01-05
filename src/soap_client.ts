import { encodeBase64 } from "https://deno.land/std@0.210.0/encoding/base64.ts";
import {
  BasicAuthentication,
  constractHost,
  HttpResponse,
  WinRMHost,
} from "./common.ts";

export class SoapClient {
  private winrmServer: string;

  constructor(
    private auth: BasicAuthentication,
    private host: WinRMHost | string,
  ) {
    this.winrmServer = constractHost(this.host);
  }

  async httpRequest(soap: string): Promise<HttpResponse> {
    const auth = this.getBasicAuth(this.auth.username, this.auth.password);

    try {
      const respose = await fetch(this.winrmServer, {
        method: "POST",
        cache: "no-cache",
        headers: {
          "Authorization": auth,
          "Content-Type": "application/soap+xml;charset=UTF-8",
          "User-Agent": "Deno WinRM Client",
          "Content-Length": `${soap.length}`,
        },
        body: soap,
      });

      const body = await respose.text();
      return {
        body: body,
        status: respose.status,
        statusText: respose.statusText,
      };
    } catch (error) {
      return {
        body: error.toString(),
        status: 0,
        statusText: "",
      };
    }
  }

  private getBasicAuth(username: string, password: string): string {
    return `Basic ${encodeBase64(username + ":" + password)}`;
  }
}
