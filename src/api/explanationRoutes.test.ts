import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ServerResponse } from "node:http";
import { createInMemoryStorage } from "./storage";
import { createScanSession } from "./session";
import { handleFindingExplanationRequest } from "./explanationRoutes";
import type { ExplanationProvider } from "./explanation";

function captureResponse() {
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
    } as never as ServerResponse,
    read() {
      return { statusCode, body: JSON.parse(body) as Record<string, unknown> };
    },
  };
}

function sessionWithFinding() {
  const session = createScanSession("https://example.com");
  return {
    ...session,
    findings: [{
      id: "finding-1",
      rule: "responsive.horizontal-overflow",
      category: "responsive" as const,
      title: "Horizontal overflow",
      severity: "medium" as const,
      description: "The page overflows horizontally.",
      url: session.url,
      viewport: { name: "Mobile", width: 390, height: 844 },
      selector: ".pricing-grid",
      detectedAt: "2026-09-26T10:00:00.000Z",
      status: "open" as const,
      evidence: [{ type: "measurement" as const, metric: "overflow", value: 42, unit: "px" as const }],
    }],
  };
}

describe("finding explanation route", () => {
  it("returns fallback explanation for a stored finding", async () => {
    const storage = createInMemoryStorage();
    const session = sessionWithFinding();
    await storage.scans.create(session);
    const capture = captureResponse();

    const provider: ExplanationProvider = {
      async explain({ finding }) {
        return {
          findingId: finding.id,
          source: "fallback",
          summary: finding.description,
          technical: "Measured overflow=42px.",
          context: ["Rule: " + finding.rule],
          uncertainty: "Deterministic context only.",
          generatedAt: "2026-09-26T10:00:00.000Z",
        };
      },
    };

    await handleFindingExplanationRequest(
      capture.response,
      storage,
      session.id,
      "finding-1",
      provider,
    );

    const result = capture.read();
    assert.equal(result.statusCode, 200);
    assert.equal((result.body as { ok: boolean }).ok, true);
    assert.equal(
      (result.body as { explanation: { findingId: string } }).explanation.findingId,
      "finding-1",
    );
  });

  it("returns 404 for an unknown finding", async () => {
    const storage = createInMemoryStorage();
    const session = sessionWithFinding();
    await storage.scans.create(session);
    const capture = captureResponse();

    await handleFindingExplanationRequest(
      capture.response,
      storage,
      session.id,
      "missing",
      { explain: async () => {
        throw new Error("should not be called");
      } },
    );

    assert.equal(capture.read().statusCode, 404);
  });

  it("rejects a provider response for the wrong finding", async () => {
    const storage = createInMemoryStorage();
    const session = sessionWithFinding();
    await storage.scans.create(session);
    const capture = captureResponse();

    await handleFindingExplanationRequest(
      capture.response,
      storage,
      session.id,
      "finding-1",
      {
        explain: async () => ({
          findingId: "different-finding",
          source: "ai",
          summary: "Wrong target",
          technical: "Wrong target",
          context: [],
          generatedAt: "2026-09-26T10:00:00.000Z",
        }),
      },
    );

    assert.equal(capture.read().statusCode, 502);
  });
});
