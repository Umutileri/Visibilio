import { scanPage } from "./scanPage";
import type { ScanResult } from "./types";
import type { ScanOptions } from "./scanPage";
import { initialViewports } from "./viewports";

export interface ViewportScanResult {
  url: string;
  results: ScanResult[];
}

export async function scanViewports(
  url: string,
  shouldCancel?: () => Promise<boolean>,
  options: ScanOptions = {},
): Promise<ViewportScanResult> {
  const results: ScanResult[] = [];

  for (const viewport of initialViewports) {
    if (shouldCancel && (await shouldCancel())) break;
    results.push(await scanPage(url, viewport, options));
  }

  return { url, results };
}
