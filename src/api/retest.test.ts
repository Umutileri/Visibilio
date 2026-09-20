import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { UIssue } from "../scanner/types";
import { compareFindingSets } from "./retest";

function finding(overrides: Partial<UIssue>): UIssue {
  return {
    id: "finding",
    rule: "responsive.horizontal-overflow",
    category: "responsive",
    title: "Horizontal overflow",
    severity: "medium",
    description: "Content exceeds the viewport.",
    url: "https://example.com",
    viewport: { name: "Mobile", width: 390, height: 844 },
    detectedAt: "2026-09-20T12:00:00.000Z",
    status: "open",
    ...overrides,
  };
}

describe("compareFindingSets", () => {
  it("marks a finding as resolved when the same finding disappears", () => {
    const before = finding({
      id: "before",
      selector: ".content",
      measurements: { horizontalOverflow: 34 },
    });

    const result = compareFindingSets([before], []);

    assert.deepEqual(result[0], {
      previousFindingId: "before",
      rule: before.rule,
      selector: ".content",
      viewport: before.viewport,
      status: "resolved",
      previousMeasurements: { horizontalOverflow: 34 },
    });
  });

  it("marks a finding as still-open when measurements are unchanged", () => {
    const before = finding({
      id: "before",
      selector: ".content",
      measurements: { horizontalOverflow: 34 },
    });
    const after = finding({
      id: "after",
      selector: ".content",
      measurements: { horizontalOverflow: 34 },
    });

    const result = compareFindingSets([before], [after]);

    assert.equal(result[0].status, "still-open");
    assert.equal(result[0].currentFindingId, "after");
  });

  it("marks a finding as changed when its measurements move", () => {
    const before = finding({
      id: "before",
      selector: ".content",
      measurements: { horizontalOverflow: 34 },
    });
    const after = finding({
      id: "after",
      selector: ".content",
      measurements: { horizontalOverflow: 8 },
    });

    const result = compareFindingSets([before], [after]);

    assert.equal(result[0].status, "changed");
    assert.deepEqual(result[0].currentMeasurements, {
      horizontalOverflow: 8,
    });
  });
});
