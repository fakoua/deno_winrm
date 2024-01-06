import {
  assertEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.182.0/testing/asserts.ts";

import {
  message_command,
  message_commandid,
  message_delete_shellid,
  message_shellid,
} from "./soap_messages.ts";

Deno.test("should return a string with a SOAP envelope containing the server and messageId parameters", () => {
  const server = "http://example.com";
  const messageId = "12345";

  const expectedEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
    <s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:p="http://schemas.microsoft.com/wbem/wsman/1/wsman.xsd" xmlns:rsp="http://schemas.microsoft.com/wbem/wsman/1/windows/shell" xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:wsman="http://schemas.dmtf.org/wbem/wsman/1/wsman.xsd">
       <s:Header>
          <wsa:To>${server}</wsa:To>
          <wsman:ResourceURI mustUnderstand="true">http://schemas.microsoft.com/wbem/wsman/1/windows/shell/cmd</wsman:ResourceURI>
          <wsa:ReplyTo>
             <wsa:Address mustUnderstand="true">http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</wsa:Address>
          </wsa:ReplyTo>
          <wsman:MaxEnvelopeSize mustUnderstand="true">153600</wsman:MaxEnvelopeSize>
          <wsa:MessageID>uuid:${messageId}</wsa:MessageID>
          <wsman:Locale mustUnderstand="false" xml:lang="en-US" />
          <wsman:OperationTimeout>PT60S</wsman:OperationTimeout>
          <wsa:Action mustUnderstand="true">http://schemas.xmlsoap.org/ws/2004/09/transfer/Create</wsa:Action>
          <wsman:OptionSet>
             <wsman:Option Name="WINRS_NOPROFILE">FALSE</wsman:Option>
             <wsman:Option Name="WINRS_CODEPAGE">437</wsman:Option>
          </wsman:OptionSet>
       </s:Header>
       <s:Body>
          <rsp:Shell>
             <rsp:InputStreams>stdin</rsp:InputStreams>
             <rsp:OutputStreams>stderr stdout</rsp:OutputStreams>
          </rsp:Shell>
       </s:Body>
    </s:Envelope>`;

  const result = message_shellid(server, messageId);

  assertEquals(result, expectedEnvelope);
});

Deno.test("should return a string with a SOAP envelope containing the correct ResourceURI", () => {
  const server = "http://example.com";
  const messageId = "12345";

  const result = message_shellid(server, messageId);

  assertStringIncludes(
    result,
    "http://schemas.microsoft.com/wbem/wsman/1/windows/shell/cmd", //NOSONAR
  );
});

Deno.test("should return a string with an XML envelope containing the input parameters", () => {
  // Arrange
  const server = "testServer";
  const messageId = "testMessageId";
  const shellId = "testShellId";
  const command = "testCommand";

  // Act
  const result = message_commandid(server, messageId, shellId, command);

  // Assert
  assertStringIncludes(result, "<s:Envelope");
  assertStringIncludes(result, `<wsa:To>${server}</wsa:To>`);
  assertStringIncludes(
    result,
    `<wsa:MessageID>uuid:${messageId}</wsa:MessageID>`,
  );
  assertStringIncludes(
    result,
    `<wsman:Selector Name="ShellId">${shellId}</wsman:Selector>`,
  );
  assertStringIncludes(result, `<rsp:Command>${command}</rsp:Command>`);
});

Deno.test("should include the correct server address, message ID, shell ID, and command ID in the SOAP envelope", () => {
  const server = "http://example.com";
  const messageId = "123456";
  const shellId = "7890";
  const commandId = "abcd";

  const result = message_command(server, messageId, shellId, commandId);

  assertStringIncludes(result, `<wsa:To>${server}</wsa:To>`);
  assertStringIncludes(
    result,
    `<wsa:MessageID>uuid:${messageId}</wsa:MessageID>`,
  );
  assertStringIncludes(
    result,
    `<wsman:Selector Name="ShellId">${shellId}</wsman:Selector>`,
  );
  assertStringIncludes(
    result,
    `<rsp:DesiredStream CommandId="${commandId}">stdout stderr</rsp:DesiredStream>`,
  );
});

Deno.test("should include the correct shellId value in the 'Selector' tag of the SOAP envelope header", () => {
  // Arrange
  const server = "http://example.com";
  const messageId = "1234";
  const shellId = "5678";

  // Act
  const result = message_delete_shellid(server, messageId, shellId);

  // Assert
  assertStringIncludes(
    result,
    "<wsman:Selector Name='ShellId'>5678</wsman:Selector>",
  );
});
