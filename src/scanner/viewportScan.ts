import { scanPage } from "./scanPage";
import type { ScanResult } from "./types";
import type { ScanOptions } from "./scanPage";
import { initialViewports } from "./viewports";

export interface ViewportScanResult {
  url: string;
  results: ScanResult[];
}

export interface ViewportScanOptions extends ScanOptions {
  shouldCancel?: () => Promise<boolean>;
}

export async function scanViewports(
  url: string,
  options: ViewportScanOptions = {},
): Promise<ViewportScanResult> {
  const { shouldCancel, ...scanOptions } = options;
  const results: ScanResult[] = [];

  for (const viewport of initialViewports) {
    if (cancel && (await cancel())) break;
    results.push(await scanPage(url, viewport, scanOptions));
  }

  return { url, results };
}
