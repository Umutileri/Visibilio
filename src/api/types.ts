import type { ScanResult, ViewportPreset } from "../scanner/types";
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
    code: "INVALID_REQUEST" | "INVALID_URL" | "SCAN_ERROR";
    message: string;
  };
}

export type ScanApiResponse = ScanApiSuccess | ScanApiFailure;
