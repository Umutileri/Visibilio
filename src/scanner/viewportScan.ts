import { scanPage } from "./scanPage";
import type { ScanResult } from "./types";
import { initialViewports } from "./viewports";

export interface ViewportScanResult {
  url: string;
  results: ScanResult[];
}

export async function scanViewports(
  url: string,
  shouldCancel?: () => Promise<boolean>,
): Promise<ViewportScanResult> {
  const results: ScanResult[] = [];

  for (const viewport of initialViewports) {
    if (shouldCancel && (await shouldCancel())) break;
    results.push(await scanPage(url, viewport));
  }

  return { url, results };
}
