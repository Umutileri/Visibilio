import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ScanResult } from "../scanner/types";
import {
  createScanSession,
  sessionStatusFromResults,
  buildRetestComparison,
  updateScanSession,
} from "./session";

describe("scan session", () => {
  it("creates a queued session with a stable id shape", () => {
    const session = createScanSession("https://example.com");

    assert.match(session.id, /^scan_/);
    assert.equal(session.status, "queued");
    assert.equal(session.url, "https://example.com");
    assert.equal(session.siteKey, "example.com:443");
    assert.equal(session.siteName, "example.com");
    assert.deepEqual(session.results, []);
    assert.deepEqual(session.findings, []);
  });

  it("derives lifecycle status from viewport results", () => {
    const success = { ok: true } as ScanResult;
    const failure = { ok: false } as ScanResult;

    assert.equal(sessionStatusFromResults([]), "queued");
    assert.equal(sessionStatusFromResults([success]), "completed");
    assert.equal(sessionStatusFromResults([success, failure]), "failed");
  });

  it("updates only the supplied session fields", () => {
    const session = createScanSession("https://example.com");
    const updated = updateScanSession(session, {
      status: "scanning",
      startedAt: "2026-09-20T12:00:00.000Z",
    });

    assert.equal(updated.url, session.url);
    assert.equal(updated.status, "scanning");
    assert.equal(updated.startedAt, "2026-09-20T12:00:00.000Z");
  });
});

describe("website identity", () => {
  it("normalizes website identity from the scan URL", async () => {
    const { getWebsiteKey, getWebsiteName } = await import("./session");
    assert.equal(getWebsiteKey("https://WWW.Example.com/pricing"), "example.com:443");
    assert.equal(getWebsiteKey("http://example.com"), "example.com:80");
    assert.equal(getWebsiteKey("http://example.com:8080"), "example.com:8080");
    assert.equal(getWebsiteName("https://example.com/pricing"), "example.com");
    assert.equal(getWebsiteName("https://WWW.Example.com/pricing"), "example.com");
  });
});

describe("retest comparison", () => {
  it("does not mark a missing selector as resolved", () => {
    const original = {
      id: "finding-1",
      rule: "responsive.horizontal-overflow",
      category: "responsive" as const,
      title: "Horizontal overflow",
      severity: "medium" as const,
      description: "Overflow",
      url: "https://example.com",
      viewport: { name: "Mobile", width: 390, height: 844 },
      selector: ".pricing-grid",
      detectedAt: "2026-09-26T10:00:00.000Z",
      status: "open" as const,
    };
    const result = {
      ok: true as const,
      url: original.url,
      viewport: original.viewport,
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
        path: ".visibilio/evidence/mobile.png",
        viewport: original.viewport,
        width: 390,
        height: 844,
        capturedAt: original.detectedAt,
      },
      issues: [],
    };

    assert.equal(buildRetestComparison(original, [result]).outcome, "not-found");
  });
});
