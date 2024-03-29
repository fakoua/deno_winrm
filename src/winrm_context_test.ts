import * as mf from "https://deno.land/x/mock_fetch@0.3.0/mod.ts";
import { WinRMContext } from "./winrm_context.ts";
import {
  assert,
  assertRejects,
} from "https://deno.land/std@0.211.0/assert/mod.ts";

const ResponseShellId =
  `<s:Envelope xml:lang="en-US" xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:x="http://schemas.xmlsoap.org/ws/2004/09/transfer" xmlns:w="http://schemas.dmtf.org/wbem/wsman/1/wsman.xsd" xmlns:rsp="http://schemas.microsoft.com/wbem/wsman/1/windows/shell" xmlns:p="http://schemas.microsoft.com/wbem/wsman/1/wsman.xsd"><s:Header><a:Action>http://schemas.xmlsoap.org/ws/2004/09/transfer/CreateResponse</a:Action><a:MessageID>uuid:A222962A-9A19-4095-AE9C-3CB8CA4BE046</a:MessageID><a:To>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:To><a:RelatesTo>uuid:39747994-4352-46f0-9f57-3fceecb316c6</a:RelatesTo></s:Header><s:Body><x:ResourceCreated><a:Address>http://SamFlex:5985/wsman</a:Address><a:ReferenceParameters><w:ResourceURI>http://schemas.microsoft.com/wbem/wsman/1/windows/shell/cmd</w:ResourceURI><w:SelectorSet><w:Selector Name="ShellId">1EDE9168-37EF-4F4C-981E-F2DF879B951A</w:Selector></w:SelectorSet></a:ReferenceParameters></x:ResourceCreated><rsp:Shell xmlns:rsp="http://schemas.microsoft.com/wbem/wsman/1/windows/shell"><rsp:ShellId>1EDE9168-37EF-4F4C-981E-F2DF879B951A</rsp:ShellId><rsp:ResourceUri>http://schemas.microsoft.com/wbem/wsman/1/windows/shell/cmd</rsp:ResourceUri><rsp:Owner>winrm</rsp:Owner><rsp:ClientIP>fe80::fc1e:8ede:f8f9:8c8d%4</rsp:ClientIP><rsp:IdleTimeOut>PT7200.000S</rsp:IdleTimeOut><rsp:InputStreams>stdin</rsp:InputStreams><rsp:OutputStreams>stderr stdout</rsp:OutputStreams><rsp:ShellRunTime>P0DT0H0M0S</rsp:ShellRunTime><rsp:ShellInactivity>P0DT0H0M0S</rsp:ShellInactivity></rsp:Shell></s:Body></s:Envelope>`;

const ResponseCommandId =
  `<s:Envelope xml:lang="en-US" xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:x="http://schemas.xmlsoap.org/ws/2004/09/transfer" xmlns:w="http://schemas.dmtf.org/wbem/wsman/1/wsman.xsd" xmlns:rsp="http://schemas.microsoft.com/wbem/wsman/1/windows/shell" xmlns:p="http://schemas.microsoft.com/wbem/wsman/1/wsman.xsd"><s:Header><a:Action>http://schemas.microsoft.com/wbem/wsman/1/windows/shell/CommandResponse</a:Action><a:MessageID>uuid:D3FCD7BD-B7C3-47A2-9A59-C3C04ECA1CA2</a:MessageID><a:To>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:To><a:RelatesTo>uuid:7adc77ee-b565-4975-b22d-eba8cff76da3</a:RelatesTo></s:Header><s:Body><rsp:CommandResponse><rsp:CommandId>DBFA32CB-A29C-4030-AC7D-4EF74EB2FB41</rsp:CommandId></rsp:CommandResponse></s:Body></s:Envelope>`;

const ResponseCommand = `<s:Envelope xml:lang="en-US"
  xmlns:s="http://www.w3.org/2003/05/soap-envelope"
  xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing"
  xmlns:w="http://schemas.dmtf.org/wbem/wsman/1/wsman.xsd"
  xmlns:rsp="http://schemas.microsoft.com/wbem/wsman/1/windows/shell"
  xmlns:p="http://schemas.microsoft.com/wbem/wsman/1/wsman.xsd">
  <s:Header>
      <a:Action>http://schemas.microsoft.com/wbem/wsman/1/windows/shell/ReceiveResponse</a:Action>
      <a:MessageID>uuid:CC6A642E-3643-493D-8ED0-73AA4A31F7F2</a:MessageID>
      <a:To>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:To>
      <a:RelatesTo>uuid:15d05637-f426-4276-82f2-5d124aec8cd2</a:RelatesTo>
  </s:Header>
  <s:Body>
      <rsp:ReceiveResponse>
          <rsp:Stream Name="stdout" CommandId="1149F808-53D2-458C-B51A-46C6B26177E4">T0s=</rsp:Stream>
          <rsp:Stream Name="stderr" CommandId="1149F808-53D2-458C-B51A-46C6B26177E4" End="true"></rsp:Stream>
          <rsp:CommandState CommandId="1149F808-53D2-458C-B51A-46C6B26177E4" State="http://schemas.microsoft.com/wbem/wsman/1/windows/shell/CommandState/Done">
              <rsp:ExitCode>0</rsp:ExitCode>
          </rsp:CommandState>
      </rsp:ReceiveResponse>
  </s:Body>
</s:Envelope>`;

const ResponseErrorShellId =
  `<s:Envelope xml:lang="en-US" xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:x="http://schemas.xmlsoap.org/ws/2004/09/transfer" xmlns:e="http://schemas.xmlsoap.org/ws/2004/08/eventing" xmlns:n="http://schemas.xmlsoap.org/ws/2004/09/enumeration" xmlns:w="http://schemas.dmtf.org/wbem/wsman/1/wsman.xsd" xmlns:p="http://schemas.microsoft.com/wbem/wsman/1/wsman.xsd">
<s:Header>
    <a:Action>http://schemas.dmtf.org/wbem/wsman/1/wsman/fault</a:Action>
    <a:MessageID>uuid:2B81868F-56FA-4BD9-8904-F2D0E651F496</a:MessageID>
    <a:To>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:To>
    <a:RelatesTo>uuid:c8be6032-291f-4796-9855-dbe5fdcf1c14</a:RelatesTo>
</s:Header>
<s:Body>
    <s:Fault>
        <s:Code>
            <s:Value>s:Sender</s:Value>
            <s:Subcode>
                <s:Value>w:InvalidSelectors</s:Value>
            </s:Subcode>
        </s:Code>
        <s:Reason>
            <s:Text xml:lang="en-US">Error Text</s:Text>
        </s:Reason>
        <s:Detail>
            <w:FaultDetail>http://schemas.dmtf.org/wbem/wsman/1/wsman/faultDetail/UnexpectedSelectors</w:FaultDetail>
            <f:WSManFault xmlns:f="http://schemas.microsoft.com/wbem/wsman/1/wsmanfault" Code="2150858843" Machine="windows-host">
                <f:Message>Error Message</f:Message>
            </f:WSManFault>
        </s:Detail>
    </s:Fault>
</s:Body>
</s:Envelope>`;

const ResponseDeleteShell =
  `<s:Envelope xml:lang=en-US xmlns:s=http://www.w3.org/2003/05/soap-envelope xmlns:a=http://schemas.xmlsoap.org/ws/2004/08/addressing xmlns:w=http://schemas.dmtf.org/wbem/wsman/1/wsman.xsd xmlns:p=http://schemas.microsoft.com/wbem/wsman/1/wsman.xsd><s:Header><a:Action>http://schemas.xmlsoap.org/ws/2004/09/transfer/DeleteResponse</a:Action><a:MessageID>uuid:EA96564D-570F-4B2E-8AB3-4E5B3DFA0B5E</a:MessageID><a:To>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:To><a:RelatesTo>uuid:279bd348-ac3a-4b80-a352-d5e3fe73bf36</a:RelatesTo></s:Header><s:Body></s:Body></s:Envelope>`;

Deno.test("Should run a command", async () => {
  //Setup
  mf.install();

  mf.mock("POST@/wsman", (_req, _) => {
    if (_req.headers.get("content-length") == "1583") {
      return new Response(ResponseShellId, {
        status: 200,
      });
    }
    if (_req.headers.get("content-length") == "1702") {
      return new Response(ResponseCommandId, {
        status: 200,
      });
    }

    if (_req.headers.get("content-length") == "1553") {
      return new Response(ResponseCommand, {
        status: 200,
      });
    }
    return new Response(`hi`, {
      status: 200,
    });
  });

  //Action
  const context = new WinRMContext(
    { username: "test", password: "test" }, //NOSONAR
    "example.com",
  );

  const res = await context.runCommand("PING");

  //Assert
  assert(!res.error);
  mf.uninstall();
});

Deno.test("Should run a command with context", async () => {
  //Setup
  mf.install();

  mf.mock("POST@/wsman", (_req, _) => {
    if (_req.headers.get("content-length") == "1583") {
      return new Response(ResponseShellId, {
        status: 200,
      });
    }
    if (_req.headers.get("content-length") == "1702") {
      return new Response(ResponseCommandId, {
        status: 200,
      });
    }

    if (_req.headers.get("content-length") == "1553") {
      return new Response(ResponseCommand, {
        status: 200,
      });
    }
    return new Response(`hi`, {
      status: 200,
    });
  });

  //Action
  const context = new WinRMContext(
    { username: "test", password: "test" }, //NOSONAR
    "example.com",
  );

  await context.openShell();
  const res = await context.runCommand("PING");
  await context.closeShell();
  //Assert
  assert(!res.error);
  mf.uninstall();
});

Deno.test("Should run powershell", async () => {
  //Setup
  mf.install();

  mf.mock("POST@/wsman", (_req, _) => {
    if (_req.headers.get("content-length") == "1583") {
      return new Response(ResponseShellId, {
        status: 200,
      });
    }
    if (_req.headers.get("content-length") == "1741") {
      return new Response(ResponseCommandId, {
        status: 200,
      });
    }

    if (_req.headers.get("content-length") == "1553") {
      return new Response(ResponseCommand, {
        status: 200,
      });
    }
    return new Response(`hi`, {
      status: 200,
    });
  });

  //Action
  const context = new WinRMContext(
    { username: "test", password: "test" }, //NOSONAR
    "example.com",
  );

  const res = await context.runPowerShell("PING");

  //Assert
  assert(!res.error);
  mf.uninstall();
});

Deno.test("ShellId Exception", async () => {
  //Setup
  mf.install();

  mf.mock("POST@/wsman", (_req, _) => {
    if (_req.headers.get("content-length") == "1583") {
      return new Response(ResponseErrorShellId, {
        status: 500,
      });
    }

    return new Response(`hi`, {
      status: 500,
    });
  });

  //Action
  const context = new WinRMContext(
    { username: "test", password: "test" }, //NOSONAR
    "example.com",
  );

  const res = await context.runCommand("PING");

  //Assert
  assert(res.error);
  mf.uninstall();
});

Deno.test("CommandId Exception", async () => {
  //Setup
  mf.install();

  mf.mock("POST@/wsman", (_req, _) => {
    if (_req.headers.get("content-length") == "1583") {
      return new Response(ResponseShellId, {
        status: 200,
      });
    }
    if (_req.headers.get("content-length") == "1702") {
      return new Response("ERROR", {
        status: 500,
      });
    }
    return new Response(`hi`, {
      status: 200,
    });
  });

  //Action
  const context = new WinRMContext(
    { username: "test", password: "test" }, //NOSONAR
    "example.com",
  );

  const res = await context.runCommand("PING");

  //Assert
  assert(res.error);
  mf.uninstall();
});

Deno.test("Command Error", async () => {
  //Setup
  mf.install();

  mf.mock("POST@/wsman", (_req, _) => {
    if (_req.headers.get("content-length") == "1583") {
      return new Response(ResponseShellId, {
        status: 200,
      });
    }
    if (_req.headers.get("content-length") == "1702") {
      return new Response(ResponseCommandId, {
        status: 200,
      });
    }

    if (_req.headers.get("content-length") == "1553") {
      return new Response("ERROR", {
        status: 500,
      });
    }
    return new Response(`hi`, {
      status: 200,
    });
  });

  //Action
  const context = new WinRMContext(
    { username: "test", password: "test" }, //NOSONAR
    "example.com",
  );

  const res = await context.runCommand("PING");
  //Assert
  assert(res.error);
  mf.uninstall();
});

Deno.test("Open Shell should run", async () => {
  //Setup
  mf.install();

  mf.mock("POST@/wsman", (_req, _) => {
    if (_req.headers.get("content-length") == "1583") {
      return new Response(ResponseShellId, {
        status: 200,
      });
    }
    return new Response(`hi`, {
      status: 200,
    });
  });

  //Action
  const context = new WinRMContext(
    { username: "test", password: "test" }, //NOSONAR
    "example.com",
  );

  const res = await context.openShell();

  //Assert
  assert(res);
  mf.uninstall();
});

Deno.test("Open Shell and close should run", async () => {
  //Setup
  mf.install();

  mf.mock("POST@/wsman", (_req, _) => {
    if (_req.headers.get("content-length") == "1583") {
      return new Response(ResponseShellId, {
        status: 200,
      });
    }
    if (_req.headers.get("content-length") == "1317") {
      return new Response(ResponseDeleteShell, {
        status: 200,
      });
    }
    return new Response(`hi`, {
      status: 200,
    });
  });

  //Action
  const context = new WinRMContext(
    { username: "test", password: "test" }, //NOSONAR
    "example.com",
  );

  const res1 = await context.openShell();
  const res2 = await context.closeShell();

  //Assert
  assert(res1);
  assert(res2);
  mf.uninstall();
});

Deno.test("Open Shell twice exception", async () => {
  //Setup
  mf.install();

  mf.mock("POST@/wsman", (_req, _) => {
    if (_req.headers.get("content-length") == "1583") {
      return new Response(ResponseShellId, {
        status: 200,
      });
    }
    return new Response(`hi`, {
      status: 200,
    });
  });

  //Action
  const context = new WinRMContext(
    { username: "test", password: "test" }, //NOSONAR
    "example.com",
  );

  await context.openShell();
  //Assert
  assertRejects(async (): Promise<void> => {
    await context.openShell();
  });
  mf.uninstall();
});

Deno.test("Close Shell before open exception", () => {
  //Setup
  mf.install();

  mf.mock("POST@/wsman", (_req, _) => {
    if (_req.headers.get("content-length") == "1317") {
      return new Response(ResponseDeleteShell, {
        status: 200,
      });
    }
    return new Response(`hi`, {
      status: 200,
    });
  });

  //Action
  const context = new WinRMContext(
    { username: "test", password: "test" }, //NOSONAR
    { hostname: "example.com", port: 5985, protocol: "http" },
  );

  //Assert
  assertRejects(async (): Promise<void> => {
    await context.closeShell();
  });
  mf.uninstall();
});
