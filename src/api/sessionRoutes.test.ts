import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ScanSession } from "./sessionTypes";
import { createScanSession } from "./session";
import {
  handleScanFindingStatusRequest,
  handleScanSessionGetRequest,
  handleScanSessionListRequest,
  handleScanSessionCancelRequest,
  handleScanArtifactGetRequest,
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

describe("session cancellation route", () => {
  it("cancels a queued or scanning session", async () => {
    const capture = createResponseCapture();
    const session = { ...createScanSession("https://example.com"), status: "scanning" as const };

    let updated: ScanSession | null = null;
    await handleScanSessionCancelRequest(
      capture.response,
      session.id,
      async (id) => (id === session.id ? session : null),
      async (next) => {
        updated = next;
        return next;
      },
    );

    const result = capture.read();
    assert.equal(result.statusCode, 200);
    assert.equal(updated?.status, "cancelled");
    assert.equal((result.body as { ok: boolean }).ok, true);
  });

  it("returns 404 for an unknown session", async () => {
    const capture = createResponseCapture();

    await handleScanSessionCancelRequest(
      capture.response,
      "scan_missing",
      async () => null,
      async (next) => next,
    );

    const result = capture.read();
    assert.equal(result.statusCode, 404);
  });

  it("rejects cancellation after a terminal state", async () => {
    const capture = createResponseCapture();
    const session = { ...createScanSession("https://example.com"), status: "completed" as const };

    await handleScanSessionCancelRequest(
      capture.response,
      session.id,
      async () => session,
      async (next) => next,
    );

    const result = capture.read();
    assert.equal(result.statusCode, 409);
  });
});

describe("scan artifact route", () => {
  it("returns artifact metadata by stable id", async () => {
    const capture = createResponseCapture();
    const session = {
      ...createScanSession("https://example.com"),
      artifacts: [{
        id: "scan_test_mobile",
        kind: "screenshot" as const,
        contentType: "image/png" as const,
        path: ".visibilio/evidence/mobile.png",
        viewport: { name: "Mobile", width: 390, height: 844 },
        capturedAt: new Date().toISOString(),
      }],
    };

    await handleScanArtifactGetRequest(
      capture.response,
      session.id,
      "scan_test_mobile",
      async (id) => (id === session.id ? session : null),
    );

    const result = capture.read();
    assert.equal(result.statusCode, 200);
    assert.deepEqual(result.body, {
      ok: true,
      artifact: session.artifacts[0],
    });
  });

  it("returns 404 for an unknown artifact", async () => {
    const capture = createResponseCapture();
    const session = { ...createScanSession("https://example.com"), artifacts: [] };

    await handleScanArtifactGetRequest(
      capture.response,
      session.id,
      "missing-artifact",
      async () => session,
    );

    const result = capture.read();
    assert.equal(result.statusCode, 404);
  });
});

describe("finding status route", () => {
  it("updates a finding status inside a session", async () => {
    const capture = createResponseCapture();
    const session = createScanSession("https://example.com");
    const finding = {
      id: "finding-1",
      rule: "responsive.horizontal-overflow",
      category: "responsive" as const,
      title: "Horizontal overflow detected",
      severity: "medium" as const,
      description: "The page overflows.",
      url: session.url,
      viewport: { name: "Mobile", width: 390, height: 844 },
      detectedAt: new Date().toISOString(),
      status: "open" as const,
    };

    const withFinding: ScanSession = { ...session, findings: [finding] };

    let updatedSession: ScanSession = withFinding;
    await handleScanFindingStatusRequest(
      capture.response,
      withFinding.id,
      finding.id,
      "resolved",
      async (id) => (id === withFinding.id ? withFinding : null),
      async (next) => {
        updatedSession = next;
        return next;
      },
    );

    const result = capture.read();
    assert.equal(result.statusCode, 200);
    assert.equal(updatedSession.findings[0].status, "resolved");
    assert.equal((result.body as { ok: boolean }).ok, true);
  });

  it("returns 404 for an unknown finding", async () => {
    const capture = createResponseCapture();
    const session = createScanSession("https://example.com");

    await handleScanFindingStatusRequest(
      capture.response,
      session.id,
      "missing",
      "resolved",
      async () => session,
      async (next) => next,
    );

    const result = capture.read();
    assert.equal(result.statusCode, 404);
  });
});
