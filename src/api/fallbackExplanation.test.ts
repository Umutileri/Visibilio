import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FallbackExplanationProvider } from "./fallbackExplanation";

describe("fallback explanation provider", () => {
  it("keeps the finding id and explicit scanner context", async () => {
    const provider = new FallbackExplanationProvider();
    const result = await provider.explain({
      finding: {
        id: "finding-1",
        rule: "responsive.horizontal-overflow",
        category: "responsive",
        title: "Horizontal overflow",
        severity: "medium",
        description: "The page overflows horizontally.",
        url: "https://example.com",
        viewport: { name: "Mobile", width: 390, height: 844 },
        selector: ".pricing-grid",
        detectedAt: "2026-09-26T10:00:00.000Z",
        status: "open",
        evidence: [{ type: "measurement", metric: "overflow", value: 42, unit: "px" }],
      },
      evidence: [{ type: "measurement", metric: "overflow", value: 42, unit: "px" }],
    });

    assert.equal(result.findingId, "finding-1");
    assert.equal(result.source, "fallback");
    assert.match(result.technical, /overflow=42px/);
    assert.ok(result.context.some((item) => item.includes("responsive.horizontal-overflow")));
    assert.ok(result.uncertainty?.includes("deterministic scanner"));
  });
});
