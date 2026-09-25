import type { IncomingMessage, ServerResponse } from "node:http";
import { scanViewports } from "../scanner/viewportScan";
import { createScanSession, updateScanSession } from "./session";
import { assertSafeTarget } from "./urlSafety";
import { defaultScanSessionStore } from "./sessionStore";
import type {
  ScanApiFailure,
  ScanApiRequest,
  ScanApiSuccess,
} from "./types";

const MAX_URL_LENGTH = 2048;

export async function createScanSessionRequest(
  rawUrl: string,
): Promise<ScanSession | null> {
  const url = validateScanUrl(rawUrl);
  if (!url) return null;

  await assertSafeTarget(url);

  const session = updateScanSession(createScanSession(url.toString()), {
    status: "scanning",
    startedAt: new Date().toISOString(),
  });
  await defaultScanSessionStore.create(session);

  void runScanSession(session.id, session.url);
  return session;
}

export async function runScanSession(sessionId: string, url: string): Promise<void> {
  const session = await defaultScanSessionStore.get(sessionId);
  if (!session) return;

  try {
    const result = await scanViewports(url);
    const completedSession = updateScanSession(session, {
      status: result.results.every((scan) => scan.ok) ? "completed" : "failed",
      completedAt: new Date().toISOString(),
      results: result.results,
      findings: result.results.flatMap((scan) => (scan.ok ? scan.issues : [])),
    });
    await defaultScanSessionStore.update(completedSession);
  } catch {
    await defaultScanSessionStore.update(
      updateScanSession(session, {
        status: "failed",
        completedAt: new Date().toISOString(),
      }),
    );
  }
}

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
  } catch (error) {
    failure(
      response,
      400,
      "INVALID_URL",
      error instanceof Error
        ? error.message
        : "The requested target is not allowed.",
    );
    return;
  }

  const session = updateScanSession(createScanSession(url.toString()), {
    status: "scanning",
    startedAt: new Date().toISOString(),
  });
  await defaultScanSessionStore.create(session);

  await runScanSession(session.id, session.url);
  const completedSession = await defaultScanSessionStore.get(session.id);

  if (!completedSession) {
    failure(response, 500, "SCAN_ERROR", "Scan session was not found after execution.");
    return;
  }

  if (completedSession.status === "failed") {
    failure(response, 502, "SCAN_ERROR", "Scan failed.");
    return;
  }

  const success: ScanApiSuccess = {
    ok: true,
    session: completedSession,
    url: completedSession.url,
    results: completedSession.results.map((scan) => ({
      viewport: scan.viewport,
      scan,
    })),
  };

  response.writeHead(200, { "content-type": "application/json" });
  response.end(JSON.stringify(success));
}
