import type { ScanResult, ViewportPreset } from "../scanner/types";
import type {
  ScanSession,
  ScanSessionGetResponse,
  ScanSessionListResponse,
  WebsiteProject,
} from "./sessionTypes";

export interface ScanApiRequest {
  projectId: string;
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
      | "NOT_FOUND";
    message: string;
  };
}

export type ScanApiResponse = ScanApiSuccess | ScanApiFailure;

export interface ProjectListSuccess {
  ok: true;
  projects: WebsiteProject[];
}

export type ProjectListResponse = ProjectListSuccess | ScanApiFailure;

export interface ProjectGetSuccess {
  ok: true;
  project: WebsiteProject;
}

export type ProjectGetResponse = ProjectGetSuccess | ScanApiFailure;

export type { ScanSessionGetResponse, ScanSessionListResponse };
