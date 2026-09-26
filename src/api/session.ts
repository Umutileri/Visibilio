import { randomUUID } from "node:crypto";
import type { ScanResult, UIssue } from "../scanner/types";
import type { ScanSession, ScanStatus } from "./sessionTypes";

function normalizeSiteUrl(rawUrl: string): URL {
  return new URL(rawUrl);
}

export function getWebsiteName(rawUrl: string): string {
  return normalizeSiteUrl(rawUrl).hostname.replace(/^www\./, "");
}

function effectivePort(url: URL): string {
  if (url.port) return url.port;
  return url.protocol === "https:" ? "443" : "80";
}

export function getWebsiteKey(rawUrl: string): string {
  const url = normalizeSiteUrl(rawUrl);
  return url.hostname.toLowerCase().replace(/^www\./, "") + ":" + effectivePort(url);
}

export function createScanSession(url: string): ScanSession {
  return {
    id: "scan_" + randomUUID(),
    url,
    siteKey: getWebsiteKey(url),
    siteName: getWebsiteName(url),
    status: "queued",
    createdAt: new Date().toISOString(),
    results: [],
    findings: [],
    artifacts: [],
  };
}

export function updateFindingStatus(
  session: ScanSession,
  findingId: string,
  status: UIssue["status"],
): ScanSession {
  const findings = session.findings.map((finding) =>
    finding.id === findingId ? { ...finding, status } : finding,
  );

  const results = session.results.map((result) => {
    if (!result.ok) return result;
    return {
      ...result,
      issues: result.issues.map((finding) =>
        finding.id === findingId ? { ...finding, status } : finding,
      ),
    };
  });

  return { ...session, findings, results };
}

export function updateScanSession(
  session: ScanSession,
  patch: Partial<Pick<ScanSession, "status" | "startedAt" | "completedAt">> & {
    results?: ScanResult[];
    findings?: UIssue[];
    artifacts?: ScanSession["artifacts"];
  },
): ScanSession {
  return { ...session, ...patch };
}

export function sessionStatusFromResults(results: ScanResult[]): ScanStatus {
  if (!results.length) return "queued";
  if (results.every((result) => result.ok)) return "completed";
  if (results.some((result) => !result.ok)) return "failed";
  return "scanning";
}

export function findRetestMatch(
  original: UIssue,
  results: ScanResult[],
): UIssue | undefined {
  for (const result of results) {
    if (!result.ok) continue;
    const exact = result.issues.find(
      (finding) =>
        finding.rule === original.rule &&
        finding.viewport.width === original.viewport.width &&
        finding.viewport.height === original.viewport.height &&
        finding.selector === original.selector,
    );
    if (exact) return exact;
  }

  return undefined;
}

export function buildRetestComparison(
  original: UIssue,
  results: ScanResult[],
): { before: UIssue; after?: UIssue; outcome: "resolved" | "still-present" | "not-found" } {
  const after = findRetestMatch(original, results);
  if (!after) {
    return { before: original, outcome: "not-found" };
  }
  return { before: original, after, outcome: "still-present" };
}
