export interface ViewportPreset {
  name: string;
  width: number;
  height: number;
}

export interface PageDimensions {
  viewportWidth: number;
  viewportHeight: number;
  documentWidth: number;
  documentHeight: number;
  horizontalOverflow: number;
}

export type IssueSeverity = "high" | "medium" | "low";

export type IssueStatus = "open" | "resolved" | "ignored";

export type IssueEvidence = {
  type: "measurement";
  metric: string;
  value: number;
  unit: "px";
};

export interface UIssue {
  id: string;
  rule: string;
  category: "responsive" | "accessibility" | "layout";
  title: string;
  severity: IssueSeverity;
  description: string;
  url: string;
  viewport: ViewportPreset;
  selector?: string;
  measurements?: Record<string, number>;
  evidence?: IssueEvidence[];
  detectedAt: string;
  status: IssueStatus;
}

export interface ScanSuccess {
  ok: true;
  url: string;
  viewport: ViewportPreset;
  dimensions: PageDimensions;
  issues: UIssue[];
}

export interface ScanFailure {
  ok: false;
  url: string;
  viewport: ViewportPreset;
  error: {
    code: "TIMEOUT" | "BROWSER_ERROR" | "PAGE_ERROR";
    message: string;
  };
}

export type ScanResult = ScanSuccess | ScanFailure;
