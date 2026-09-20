import type { ScanResult, UIssue } from "../scanner/types";
import type { ScanSession, ScanStatus } from "./sessionTypes";

export function createScanSession(url: string): ScanSession {
  return {
    id: "scan_" + Date.now().toString(36),
    url,
    status: "queued",
    createdAt: new Date().toISOString(),
    results: [],
    findings: [],
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
