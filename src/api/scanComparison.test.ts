import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { UIssue } from "../scanner/types";
import { createScanSession } from "./session";
import { compareScanSessions } from "./scanComparison";

function finding(
  id: string,
  rule: string,
  selector: string,
  severity: UIssue["severity"] = "medium",
): UIssue {
  return {
    id,
    rule,
    category: "responsive",
    title: id,
    severity,
    description: "Fixture finding",
    url: "https://example.com",
    viewport: { name: "Mobile", width: 390, height: 844 },
    selector,
    detectedAt: "2026-09-26T10:00:00.000Z",
    status: "open",
  };
}

describe("compareScanSessions", () => {
  it("treats the first scan as all new findings", () => {
    const current = {
      ...createScanSession("https://example.com"),
      findings: [finding("overflow", "responsive.horizontal-overflow", ".grid")],
    };

    const comparison = compareScanSessions(current);

    assert.equal(comparison.previousSessionId, undefined);
    assert.deepEqual(comparison.newFindings, current.findings);
    assert.deepEqual(comparison.resolvedFindings, []);
    assert.deepEqual(comparison.unchangedFindings, []);
  });

  it("identifies new, resolved, and unchanged findings by rule, viewport, and selector", () => {
    const previous = {
      ...createScanSession("https://example.com"),
      id: "scan_previous",
      findings: [
        finding("unchanged", "accessibility.image-missing-alt", "img#hero"),
        finding("resolved", "responsive.horizontal-overflow", ".old-grid"),
      ],
    };
    const current = {
      ...createScanSession("https://example.com"),
      id: "scan_current",
      findings: [
        finding("unchanged-new-id", "accessibility.image-missing-alt", "img#hero"),
        finding("new", "accessibility.form-control-name", "#email"),
      ],
    };

    const comparison = compareScanSessions(current, previous);

    assert.deepEqual(
      comparison.unchangedFindings.map((item) => item.id),
      ["unchanged-new-id"],
    );
    assert.deepEqual(
      comparison.newFindings.map((item) => item.id),
      ["new"],
    );
    assert.deepEqual(
      comparison.resolvedFindings.map((item) => item.id),
      ["resolved"],
    );
  });

  it("does not compare different viewport sizes as the same finding", () => {
    const previous = {
      ...createScanSession("https://example.com"),
      findings: [finding("previous", "responsive.horizontal-overflow", ".grid")],
    };
    const currentFinding = finding(
      "current",
      "responsive.horizontal-overflow",
      ".grid",
    );
    currentFinding.viewport = { name: "Desktop", width: 1440, height: 900 };

    const current = {
      ...createScanSession("https://example.com"),
      findings: [currentFinding],
    };

    const comparison = compareScanSessions(current, previous);

    assert.equal(comparison.newFindings.length, 1);
    assert.equal(comparison.resolvedFindings.length, 1);
    assert.equal(comparison.unchangedFindings.length, 0);
  });
});
