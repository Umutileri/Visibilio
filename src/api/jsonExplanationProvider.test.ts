import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { JsonExplanationProvider } from "./jsonExplanationProvider";
import { createExplanationProvider } from "./explanationFactory";

const finding = {
  id: "finding-1",
  rule: "responsive.horizontal-overflow",
  category: "responsive" as const,
  title: "Horizontal overflow",
  severity: "medium" as const,
  description: "The page overflows horizontally.",
  url: "https://example.com",
  viewport: { name: "Mobile", width: 390, height: 844 },
  selector: ".pricing-grid",
  detectedAt: "2026-09-26T10:00:00.000Z",
  status: "open" as const,
};

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("JSON explanation provider", () => {
  it("returns a validated AI explanation", async () => {
    const provider = new JsonExplanationProvider({
      endpoint: "https://ai.example.test/explain",
      maxAttempts: 1,
      fetchImpl: async () =>
        response({
          findingId: "finding-1",
          source: "ai",
          summary: "The mobile layout is wider than the viewport.",
          technical: "The element exceeds the available inline size.",
          context: ["Viewport: 390 × 844"],
          uncertainty: "Exact root cause requires source inspection.",
          generatedAt: "2026-09-26T10:00:00.000Z",
        }),
    });

    const result = await provider.explain({ finding, evidence: [] });
    assert.equal(result.source, "ai");
    assert.equal(result.findingId, "finding-1");
  });

  it("retries transient provider failures", async () => {
    let calls = 0;
    const provider = new JsonExplanationProvider({
      endpoint: "https://ai.example.test/explain",
      maxAttempts: 2,
      fetchImpl: async () => {
        calls += 1;
        if (calls === 1) return response({ error: "busy" }, 503);
        return response({
          findingId: "finding-1",
          source: "ai",
          summary: "Retry succeeded.",
          technical: "Provider recovered.",
          context: [],
          generatedAt: "2026-09-26T10:00:00.000Z",
        });
      },
    });

    const result = await provider.explain({ finding, evidence: [] });
    assert.equal(calls, 2);
    assert.equal(result.summary, "Retry succeeded.");
  });

  it("rejects malformed provider output", async () => {
    const provider = new JsonExplanationProvider({
      endpoint: "https://ai.example.test/explain",
      maxAttempts: 1,
      fetchImpl: async () => response({ findingId: "finding-1" }),
    });

    await assert.rejects(
      provider.explain({ finding, evidence: [] }),
      /invalid response/i,
    );
  });
});

describe("explanation factory", () => {
  it("uses fallback without a configured provider endpoint", () => {
    const provider = createExplanationProvider({});
    assert.equal(provider.constructor.name, "FallbackExplanationProvider");
  });

  it("uses the JSON provider when configured", () => {
    const provider = createExplanationProvider({
      VISIBILIO_EXPLANATION_ENDPOINT: "https://ai.example.test/explain",
      VISIBILIO_EXPLANATION_MODEL: "test-model",
    });
    assert.equal(provider.constructor.name, "JsonExplanationProvider");
  });
});
