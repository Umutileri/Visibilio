import type { ScanResult, ViewportPreset, UIssue } from "../scanner/types";

export type ScanStatus = "queued" | "scanning" | "completed" | "failed" | "cancelled";

export interface ScanArtifact {
  id: string;
  kind: "screenshot";
  contentType: "image/png";
  viewport: ViewportPreset;
  capturedAt: string;
}

export interface ScanSession {
  id: string;
  url: string;
  siteKey: string;
  siteName: string;
  parentSessionId?: string;
  retestOfFindingId?: string;
  status: ScanStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  results: ScanResult[];
  findings: UIssue[];
  artifacts: ScanArtifact[];
}

export interface ScanSessionStart {
  url: string;
}

export interface WebsiteRef {
  key: string;
  name: string;
  url: string;
}

export interface ScanSessionResponse {
  ok: true;
  session: ScanSession;
  viewports: ViewportPreset[];
}
