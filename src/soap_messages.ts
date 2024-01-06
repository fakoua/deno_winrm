export function message_shellid(server: string, messageId: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
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
}
export function message_commandid(
  server: string,
  messageId: string,
  shellId: string,
  command: string,
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
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
          <wsa:Action mustUnderstand="true">http://schemas.microsoft.com/wbem/wsman/1/windows/shell/Command</wsa:Action>
          <wsman:SelectorSet>
             <wsman:Selector Name="ShellId">${shellId}</wsman:Selector>
          </wsman:SelectorSet>
          <wsman:OptionSet>
             <wsman:Option Name="WINRS_CONSOLEMODE_STDIN">TRUE</wsman:Option>
             <wsman:Option Name="WINRS_SKIP_CMD_SHELL">FALSE</wsman:Option>
          </wsman:OptionSet>
       </s:Header>
       <s:Body>
          <rsp:CommandLine>
             <rsp:Command>${command}</rsp:Command>
          </rsp:CommandLine>
       </s:Body>
    </s:Envelope>`;
}
export function message_command(
  server: string,
  messageId: string,
  shellId: string,
  commandId: string,
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
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
          <wsa:Action mustUnderstand="true">http://schemas.microsoft.com/wbem/wsman/1/windows/shell/Receive</wsa:Action>
          <wsman:SelectorSet>
             <wsman:Selector Name="ShellId">${shellId}</wsman:Selector>
          </wsman:SelectorSet>
       </s:Header>
       <s:Body>
          <rsp:Receive>
             <rsp:DesiredStream CommandId="${commandId}">stdout stderr</rsp:DesiredStream>
          </rsp:Receive>
       </s:Body>
    </s:Envelope>`;
}
export function message_delete_shellid(
  server: string,
  messageId: string,
  shellId: string,
) {
  return `<?xml version='1.0'?>
   <s:Envelope
     xmlns:s='http://www.w3.org/2003/05/soap-envelope'
     xmlns:wsa='http://schemas.xmlsoap.org/ws/2004/08/addressing'
     xmlns:wsman='http://schemas.dmtf.org/wbem/wsman/1/wsman.xsd'
     xmlns:p='http://schemas.microsoft.com/wbem/wsman/1/wsman.xsd'
     xmlns:rsp='http://schemas.microsoft.com/wbem/wsman/1/windows/shell'>
     <s:Header>
       <wsa:To>${server}</wsa:To>
       <wsman:ResourceURI mustUnderstand='true'>http://schemas.microsoft.com/wbem/wsman/1/windows/shell/cmd</wsman:ResourceURI>
       <wsa:ReplyTo>
         <wsa:Address mustUnderstand='true'>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</wsa:Address>
       </wsa:ReplyTo>
       <wsman:MaxEnvelopeSize mustUnderstand='true'>153600</wsman:MaxEnvelopeSize>
       <wsa:MessageID>uuid:${messageId}</wsa:MessageID>
       <wsman:Locale mustUnderstand='false' xml:lang='en-US'/>
       <wsman:OperationTimeout>PT60S</wsman:OperationTimeout>
       <wsa:Action mustUnderstand='true'>http://schemas.xmlsoap.org/ws/2004/09/transfer/Delete</wsa:Action>
       <wsman:SelectorSet>
         <wsman:Selector Name='ShellId'>${shellId}</wsman:Selector>
       </wsman:SelectorSet>
     </s:Header>
     <s:Body/>
   </s:Envelope>`;
}
