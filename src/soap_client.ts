import { encodeBase64 } from "https://deno.land/std@0.210.0/encoding/base64.ts";
import {
  BasicAuthentication,
  constructHost,
  HttpResponse,
  WinRMHost,
} from "./common.ts";

export class SoapClient {
  private winrmServer: string;

  constructor(
    private auth: BasicAuthentication,
    private host: WinRMHost | string,
  ) {
    this.winrmServer = constructHost(this.host);
  }

  async httpRequest(soap: string): Promise<HttpResponse> {
    const auth = this.getBasicAuth(this.auth.username, this.auth.password);

    try {
      const response = await fetch(this.winrmServer, {
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

      const body = await response.text();
      return {
        body: body,
        status: response.status,
        statusText: response.statusText,
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
