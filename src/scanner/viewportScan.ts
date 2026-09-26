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
  optionsOrCancel: ScanOptions | (() => Promise<boolean>) = {},
  maybeCancel?: () => Promise<boolean>,
): Promise<ViewportScanResult> {
  const options =
    typeof optionsOrCancel === "function" ? {} : optionsOrCancel;
  const shouldCancel =
    typeof optionsOrCancel === "function" ? optionsOrCancel : maybeCancel;
  const results: ScanResult[] = [];

  for (const viewport of initialViewports) {
    if (shouldCancel && (await shouldCancel())) break;
    results.push(await scanPage(url, viewport, options));
  }

  return { url, results };
}
