import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ScanResult } from "../scanner/types";
import {
  createScanSession,
  sessionStatusFromResults,
  updateScanSession,
} from "./session";

describe("scan session", () => {
  it("creates a queued session with a stable id shape", () => {
    const session = createScanSession("https://example.com");

    assert.match(session.id, /^scan_/);
    assert.equal(session.status, "queued");
    assert.equal(session.url, "https://example.com");
    assert.equal(session.siteKey, "example.com");
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
    assert.equal(getWebsiteKey("https://WWW.Example.com/pricing"), "example.com");
    assert.equal(getWebsiteName("https://example.com/pricing"), "example.com");
  });
});
