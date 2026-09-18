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

export interface ScanSuccess {
  ok: true;
  url: string;
  viewport: ViewportPreset;
  dimensions: PageDimensions;
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
