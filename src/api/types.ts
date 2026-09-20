
export interface ScanApiRequest {
  url: string;
}

import type { ScanResult, ViewportPreset } from "../scanner/types";

export interface ScanApiSuccess {
  ok: true;
  url: string;
  results: Array<{
    viewport: ViewportPreset;
    ok: true;
    scan: ScanResult;
  } | {
    viewport: ViewportPreset;
    ok: false;
    scan: ScanResult;
  }>;
}

export interface ScanApiFailure {
  ok: false;
  error: {
    code: "INVALID_REQUEST" | "INVALID_URL" | "SCAN_ERROR";
    message: string;
  };
}

export type ScanApiResponse = ScanApiSuccess | ScanApiFailure;