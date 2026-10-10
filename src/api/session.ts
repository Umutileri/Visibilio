import type { ScanResult, UIssue } from "../scanner/types";
import type { ScanSession, ScanStatus } from "./sessionTypes";
import { buildRetestComparison, type RetestComparison } from "./retestComparison";

function createSessionId(): string {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.randomUUID) {
    throw new Error("A cryptographically secure UUID generator is required to create a scan session.");
  }
  return cryptoApi.randomUUID();
}

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
    id: "scan_" + createSessionId(),
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

