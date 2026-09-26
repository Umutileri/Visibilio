import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ScanSession } from "./sessionTypes";
import { createScanSession } from "./session";
import {
  handleScanFindingStatusRequest,
  handleScanSessionGetRequest,
  handleScanSessionListRequest,
  handleScanSessionCancelRequest,
  handleScanArtifactGetRequest,
  handleScanRetestRequest,
  handleWebsiteListRequest,
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

function createBinaryResponseCapture() {
  let statusCode = 0;
  let headers: Record<string, string> = {};
  let body: Buffer | null = null;

  return {
    response: {
      writeHead(status: number, values?: Record<string, string>) {
        statusCode = status;
        headers = values ?? {};
        return this;
      },
      end(value?: Buffer) {
        body = value ?? null;
      },
    } as never,
    read() {
      return { statusCode, headers, body };
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
    assert.equal((updated as ScanSession | null)?.status, "cancelled");
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

  it("rejects cancellation after a cancelled state", async () => {
    const capture = createResponseCapture();
    const session = { ...createScanSession("https://example.com"), status: "cancelled" as const };

    await handleScanSessionCancelRequest(
      capture.response,
      session.id,
      async () => session,
      async (next) => next,
    );

    const result = capture.read();
    assert.equal(result.statusCode, 409);
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
  it("serves screenshot bytes for a valid artifact", async () => {
    const capture = createBinaryResponseCapture();
    const session = createScanSession("https://example.com");
    const evidenceRoot = join(".visibilio", "evidence", "scan_route_test");
    const screenshotPath = join(evidenceRoot, "route-test.png");
    await mkdir(evidenceRoot, { recursive: true });
    await writeFile(screenshotPath, Buffer.from([137, 80, 78, 71]));

    try {
      const sessionWithArtifact = {
        ...session,
        artifacts: [{
          id: "scan_test_mobile",
          kind: "screenshot" as const,
          contentType: "image/png" as const,
          viewport: { name: "Mobile", width: 390, height: 844 },
          capturedAt: new Date().toISOString(),
        }],
        results: [{
          ok: true as const,
          url: "https://example.com",
          viewport: { name: "Mobile", width: 390, height: 844 },
          dimensions: {
            viewportWidth: 390,
            viewportHeight: 844,
            documentWidth: 390,
            documentHeight: 844,
            horizontalOverflow: 0,
          },
          screenshot: {
            type: "screenshot" as const,
            format: "png" as const,
            path: screenshotPath,
            viewport: { name: "Mobile", width: 390, height: 844 },
            width: 390,
            height: 844,
            capturedAt: new Date().toISOString(),
          },
          issues: [],
        }],
      };

      await handleScanArtifactGetRequest(
        capture.response,
        session.id,
        "scan_test_mobile",
        async (id) => (id === session.id ? sessionWithArtifact : null),
      );

      const result = capture.read();
      assert.equal(result.statusCode, 200);
      assert.equal(result.headers["content-type"], "image/png");
      assert.deepEqual([...((result.body as Buffer) ?? [])], [137, 80, 78, 71]);
    } finally {
      await rm(screenshotPath, { force: true });
    }
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

describe("finding retest route", () => {
  it("returns a linked retest session", async () => {
    const capture = createResponseCapture();
    const session = createScanSession("https://example.com");
    const finding = { id: "finding-1", rule: "responsive.horizontal-overflow", category: "responsive" as const, title: "Horizontal overflow detected", severity: "medium" as const, description: "The page overflows.", url: session.url, viewport: { name: "Mobile", width: 390, height: 844 }, selector: ".pricing-grid", detectedAt: "2026-09-20T10:00:00.000Z", status: "open" as const };
    const withFinding: ScanSession = { ...session, findings: [finding] };
    const retest = { ...createScanSession(session.url), parentSessionId: session.id, retestOfFindingId: finding.id, status: "completed" as const };
    await handleScanRetestRequest(capture.response, session.id, finding.id, async () => withFinding, async () => ({ ...retest, results: [] }));
    const result = capture.read();
    assert.equal(result.statusCode, 202);
    assert.equal((result.body as { ok: boolean }).ok, true);
    assert.equal((result.body as { session: ScanSession }).session.parentSessionId, session.id);
  });

  it("returns 404 for an unknown finding", async () => {
    const capture = createResponseCapture();
    const session = createScanSession("https://example.com");
    await handleScanRetestRequest(capture.response, session.id, "missing", async () => session, async () => null);
    assert.equal(capture.read().statusCode, 404);
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

describe("website routes", () => {
  it("returns websites from the website store", async () => {
    const capture = createResponseCapture();
    const websites = [
      {
        key: "example.com:443",
        name: "example.com",
        url: "https://example.com",
        createdAt: "2026-09-26T10:00:00.000Z",
        lastScanAt: "2026-09-26T10:00:00.000Z",
      },
    ];

    await handleWebsiteListRequest(capture.response, Promise.resolve(websites));

    const result = capture.read();
    assert.equal(result.statusCode, 200);
    assert.deepEqual(result.body, { ok: true, websites });
  });
});
