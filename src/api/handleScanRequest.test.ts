import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { after, before, describe, it } from "node:test";
import { handleScanRequest, validateScanUrl } from "./handleScanRequest";
import { assertSafeTarget } from "./urlSafety";

let server: Server;
let baseUrl: string;

before(async () => {
  server = createServer((request, response) => {
    if (request.url === "/api/scan") {
      void handleScanRequest(request, response);
      return;
    }
    response.writeHead(404);
    response.end();
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  baseUrl = "http://127.0.0.1:" + address.port;
});

after(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

describe("validateScanUrl", () => {
  it("accepts http and https URLs", () => {
    assert.ok(validateScanUrl("http://example.com"));
    assert.ok(validateScanUrl("https://example.com/path"));
  });

  it("rejects unsupported protocols and embedded credentials", () => {
    assert.equal(validateScanUrl("file:///tmp/page"), null);
    assert.equal(validateScanUrl("ftp://example.com"), null);
    assert.equal(validateScanUrl("https://user:pass@example.com"), null);
  });
});

describe("assertSafeTarget", () => {
  it("rejects local and private IP targets", async () => {
    for (const value of [
      "http://127.0.0.1",
      "http://10.0.0.1",
      "http://192.168.1.1",
      "http://169.254.169.254",
      "http://[::1]",
    ]) {
      await assert.rejects(assertSafeTarget(new URL(value)));
    }
  });

  it("rejects localhost hostnames", async () => {
    await assert.rejects(assertSafeTarget(new URL("http://localhost")));
    await assert.rejects(assertSafeTarget(new URL("http://api.localhost")));
  });
});

describe("handleScanRequest", () => {
  it("rejects non-POST requests", async () => {
    const response = await fetch(baseUrl + "/api/scan", { method: "GET" });
    assert.equal(response.status, 405);
  });

  it("rejects invalid JSON", async () => {
    const response = await fetch(baseUrl + "/api/scan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    });
    assert.equal(response.status, 400);
  });

  it("rejects unsupported target protocols", async () => {
    const response = await fetch(baseUrl + "/api/scan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: "file:///tmp/page" }),
    });
    const body = (await response.json()) as {
      ok: false;
      error: { code: string };
    };

    assert.equal(response.status, 400);
    assert.equal(body.error.code, "INVALID_URL");
  });

  it("rejects private literal IPs at the request boundary", async () => {
    const response = await fetch(baseUrl + "/api/scan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: "http://127.0.0.1" }),
    });
    const body = (await response.json()) as {
      ok: false;
      error: { code: string };
    };

    assert.equal(response.status, 400);
    assert.equal(body.error.code, "INVALID_URL");
  });
});
