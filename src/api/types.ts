import type { ScanResult, UIssue, ViewportPreset } from "../scanner/types";
import type { ScanSession } from "./sessionTypes";

export interface ScanApiRequest {
  url: string;
}

export interface ScanApiResult {
  viewport: ViewportPreset;
  scan: ScanResult;
}

export interface ScanApiSuccess {
  ok: true;
  session: ScanSession;
  url: string;
  results: ScanApiResult[];
}

export interface ScanApiFailure {
  ok: false;
  error: {
    code:
      | "INVALID_REQUEST"
      | "INVALID_URL"
      | "SCAN_ERROR"
      | "NOT_FOUND"
      | "INVALID_STATUS";
    message: string;
  };
}

export type ScanApiResponse = ScanApiSuccess | ScanApiFailure;

export interface ScanSessionListSuccess {
  ok: true;
  sessions: ScanSession[];
}

export type ScanSessionListResponse = ScanSessionListSuccess | ScanApiFailure;

export interface ScanFindingStatusSuccess {
  ok: true;
  session: ScanSession;
  url: string;
  results: ScanApiResult[];
}

export type ScanFindingStatusResponse =
  | ScanFindingStatusSuccess
  | ScanApiFailure;

export interface ScanSessionGetSuccess {
  ok: true;
  session: ScanSession;
}

export type ScanSessionGetResponse = ScanSessionGetSuccess | ScanApiFailure;

export interface ScanRetestRequest {
  findingId: string;
}

export interface ScanRetestSuccess {
  ok: true;
  session: ScanSession;
  comparison: {
    findingId: string;
    before: UIssue;
    after?: UIssue;
    outcome: "resolved" | "still-present" | "not-found";
  };
}

export type ScanRetestResponse = ScanRetestSuccess | ScanApiFailure;

export interface ScanSessionStartSuccess {
  ok: true;
  session: ScanSession;
}

export type ScanSessionStartResponse = ScanSessionStartSuccess | ScanApiFailure;
