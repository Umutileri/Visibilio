import type { ScanResult, ViewportPreset, UIssue } from "../scanner/types";

export type ScanStatus = "queued" | "scanning" | "completed" | "failed";

export interface ScanSession {
  id: string;
  url: string;
  status: ScanStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  results: ScanResult[];
  findings: UIssue[];
}

export interface ScanSessionStart {
  url: string;
}

export interface ScanSessionResponse {
  ok: true;
  session: ScanSession;
  viewports: ViewportPreset[];
}
