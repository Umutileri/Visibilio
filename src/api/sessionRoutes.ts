import type { ServerResponse } from "node:http";
import type { ScanSession } from "./sessionTypes";
import { updateFindingStatus } from "./session";
import type {
  ScanApiFailure,
  ScanSessionGetResponse,
  ScanSessionListResponse,
  ScanFindingStatusResponse,
} from "./types";

function json(response: ServerResponse, statusCode: number, body: unknown): void {
  response.writeHead(statusCode, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

export async function handleScanSessionListRequest(
  response: ServerResponse,
  sessions: Promise<ScanSession[]>,
): Promise<void> {
  const body: ScanSessionListResponse = {
    ok: true,
    sessions: await sessions,
  };

  json(response, 200, body);
}

export async function handleScanSessionGetRequest(
  response: ServerResponse,
  id: string,
  getSession: (sessionId: string) => Promise<ScanSession | null>,
): Promise<void> {
  const session = await getSession(id);

  if (!session) {
    const body: ScanApiFailure = {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "Scan session not found.",
      },
    };

    json(response, 404, body);
    return;
  }

  const body: ScanSessionGetResponse = { ok: true, session };
  json(response, 200, body);
}

export async function handleScanFindingStatusRequest(
  response: ServerResponse,
  sessionId: string,
  findingId: string,
  status: "open" | "resolved" | "ignored",
  getSession: (id: string) => Promise<ScanSession | null>,
  updateSession: (session: ScanSession) => Promise<ScanSession>,
): Promise<void> {
  const session = await getSession(sessionId);
  if (!session) {
    json(
      response,
      404,
      {
        ok: false,
        error: { code: "NOT_FOUND", message: "Scan session not found." },
      } satisfies ScanApiFailure,
    );
    return;
  }

  const finding = session.findings.find((item) => item.id === findingId);
  if (!finding) {
    json(
      response,
      404,
      {
        ok: false,
        error: { code: "NOT_FOUND", message: "Finding not found." },
      } satisfies ScanApiFailure,
    );
    return;
  }

  const updated = await updateSession(updateFindingStatus(session, findingId, status));
  const body: ScanFindingStatusResponse = {
    ok: true,
    session: updated,
    url: updated.url,
    results: updated.results.map((scan) => ({ viewport: scan.viewport, scan })),
  };
  json(response, 200, body);
}
