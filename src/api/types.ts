import type { ViewportPreset } from "../scanner/types";

export interface ScanApiRequest {
  url: string;
}

export interface ScanApiSuccess {
  ok: true;
  url: string;
  results: Array<{
    viewport: ViewportPreset;
    ok: boolean;
    scan: string;
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