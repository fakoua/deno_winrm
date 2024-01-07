import { denock } from "https://deno.land/x/denock@0.2.0/mod.ts";
import { SoapClient } from "./soap_client.ts";
import { assertStringIncludes } from "https://deno.land/std@0.182.0/testing/asserts.ts";
import { assertEquals } from "https://deno.land/std@0.61.0/testing/asserts.ts";

function mock1() {
  denock({
    method: "POST",
    protocol: "http",
    host: "example.com",
    headers: [
      {
        header: "content-type",
        value: "application/soap+xml;charset=UTF-8",
      },
    ],
    port: 5985,
    path: "/wsman",
    requestBody: {
      test: 1,
    },
    replyStatus: 200,
    responseBody: "valid response",
  });
}

function mock2() {
  denock({
    method: "POST",
    protocol: "http",
    host: "example.com",
    headers: [
      {
        header: "content-type",
        value: "application/soap+xml;charset=UTF-8",
      },
    ],
    port: 5985,
    path: "/wsman",
    requestBody: {
      test: 2,
    },
    replyStatus: 401,
    responseBody: "UNAUTHORIZED",
  });
  
}

Deno.test("should make a successful HTTP POST request with valid SOAP data and return a valid HTTP response", async () => {
  mock1()
  const soap = { test: 1 };
  const soapClient = new SoapClient({
    username: "username",
    password: "password", //NOSONAR
  }, "example.com");
  const response = await soapClient.httpRequest(JSON.stringify(soap));
  assertStringIncludes(response.body, "valid response");
});

Deno.test("should make a successful HTTP POST request with 200 Response", async () => {
  mock1();
  const soap = { test: 1 };
  const soapClient = new SoapClient({
    username: "username",
    password: "password", //NOSONAR
  }, "example.com");
  const response = await soapClient.httpRequest(JSON.stringify(soap));
  assertEquals(response.status, 200);
});

Deno.test("should make a successful HTTP POST request unauthorized response", async () => {
  mock2();
  const soap = { test: 2 };
  const soapClient = new SoapClient({
    username: "username1",
    password: "password1", //NOSONAR
  }, "example.com");
  const response = await soapClient.httpRequest(JSON.stringify(soap));
  assertEquals(response.status, 401);
});
