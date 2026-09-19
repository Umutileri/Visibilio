import { scanPage } from "./scanPage";
import type { ScanResult } from "./types";
import { initialViewports } from "./viewports";

export interface ViewportScanResult {
  url: string;
  results: ScanResult[];
}

export async function scanViewports(url: string): Promise<ViewportScanResult> {
  const results: ScanResult[] = [];

  for (const viewport of initialViewports) {
    results.push(await scanPage(url, viewport));
  }

  return { url, results };
}
