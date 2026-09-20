import type { IncomingMessage, ServerResponse } from "node:http";
import { scanViewports } from "../scanner/viewportScan";
import { assertSafeTarget } from "./urlSafety";
import type { ScanApiFailure, ScanApiRequest, ScanApiSuccess } from "./types";

const MAX_URL_LENGTH = 2048;

function failure(
  response: ServerResponse,
  statusCode: number,
  code: ScanApiFailure["error"]["code"],
  message: string,
): void {
  const body: ScanApiFailure = { ok: false, error: { code, message } };
  response.writeHead(statusCode, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

export function validateScanUrl(rawUrl: string): URL | null {
  if (!rawUrl || rawUrl.length > MAX_URL_LENGTH) return null;
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

export async function handleScanRequest(
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  if (request.method !== "POST") {
    failure(response, 405, "INVALID_REQUEST", "Only POST requests are supported.");
    return;
  }

  let body = "";
  for await (const chunk of request) {
    body += chunk.toString();
    if (body.length > 32000) {
      failure(response, 413, "INVALID_REQUEST", "Request body is too large.");
      return;
    }
  }

  let payload: ScanApiRequest;
  try {
    payload = JSON.parse(body) as ScanApiRequest;
  } catch {
    failure(response, 400, "INVALID_REQUEST", "Request body must be valid JSON.");
    return;
  }

  if (typeof payload.url !== "string") {
    failure(response, 400, "INVALID_REQUEST", "A URL string is required.");
    return;
  }

  const url = validateScanUrl(payload.url);
  if (!url) {
    failure(
      response,
      400,
      "INVALID_URL",
      "Use a valid HTTP or HTTPS URL without embedded credentials.",
    );
    return;
  }

  try {
    await assertSafeTarget(url);
    const result = await scanViewports(url.toString());
    const success: ScanApiSuccess = {
      ok: true,
      url: result.url,
      results: result.results.map((scan) => ({
        viewport: scan.viewport,
        scan,
      })),
    };
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(success));
  } catch (error) {
    failure(
      response,
      502,
      "SCAN_ERROR",
      error instanceof Error ? error.message : "Scan failed.",
    );
  }
}