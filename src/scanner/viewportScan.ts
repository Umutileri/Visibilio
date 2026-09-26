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
  shouldCancel?: (() => Promise<boolean>) | ScanOptions,
  options: ScanOptions = {},
): Promise<ViewportScanResult> {
  const cancel =
    typeof shouldCancel === "function" ? shouldCancel : undefined;
  const scanOptions =
    typeof shouldCancel === "function" ? options : shouldCancel ?? {};
  const results: ScanResult[] = [];

  for (const viewport of initialViewports) {
    if (cancel && (await cancel())) break;
    results.push(await scanPage(url, viewport, scanOptions));
  }

  return { url, results };
}
