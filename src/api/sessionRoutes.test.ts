import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createScanSession } from "./session";
import {
  handleScanSessionGetRequest,
  handleScanSessionListRequest,
} from "./sessionRoutes";

function createResponseCapture() {
  let statusCode = 0;
  let body = "";

  return {
    response: {
      writeHead(status: number) {
        statusCode = status;
        return this;
      },
      end(value?: string) {
        body = value ?? "";
      },
    } as never,
    read() {
      return {
        statusCode,
        body: JSON.parse(body) as Record<string, unknown>,
      };
    },
  };
}

describe("scan session routes", () => {
  it("returns a session list", async () => {
    const capture = createResponseCapture();
    const session = createScanSession("https://example.com");

    await handleScanSessionListRequest(
      capture.response,
      Promise.resolve([session]),
    );

    const result = capture.read();

    assert.equal(result.statusCode, 200);
    assert.deepEqual(result.body, { ok: true, sessions: [session] });
  });

  it("returns one session by id", async () => {
    const capture = createResponseCapture();
    const session = createScanSession("https://example.com");

    await handleScanSessionGetRequest(
      capture.response,
      session.id,
      async (id) => (id === session.id ? session : null),
    );

    const result = capture.read();

    assert.equal(result.statusCode, 200);
    assert.deepEqual(result.body, { ok: true, session });
  });

  it("returns 404 for unknown sessions", async () => {
    const capture = createResponseCapture();

    await handleScanSessionGetRequest(
      capture.response,
      "scan_missing",
      async () => null,
    );

    const result = capture.read();

    assert.equal(result.statusCode, 404);
    assert.deepEqual(result.body, {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "Scan session not found.",
      },
    });
  });
});
