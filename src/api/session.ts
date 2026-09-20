import { randomUUID } from "node:crypto";
import type { ScanResult, UIssue } from "../scanner/types";
import type { ScanSession, ScanStatus } from "./sessionTypes";

export function createScanSession(
  projectId: string,
  url: string,
): ScanSession {
  return {
    id: "scan_" + randomUUID(),
    projectId,
    url,
    status: "queued",
    createdAt: new Date().toISOString(),
    results: [],
    findings: [],
  };
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
