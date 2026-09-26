import type { ServerResponse } from "node:http";
import type { ScanSession } from "./sessionTypes";
import { buildRetestComparison, updateFindingStatus } from "./session";
import type {
  ScanApiFailure,
  ScanSessionGetResponse,
  ScanSessionListResponse,
  ScanFindingStatusResponse,
  WebsiteListResponse,
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

export async function handleScanSessionStartRequest(
  response: ServerResponse,
  session: ScanSession,
): Promise<void> {
  json(response, 202, { ok: true, session });
}

export async function handleScanSessionCancelRequest(
  response: ServerResponse,
  sessionId: string,
  getSession: (id: string) => Promise<ScanSession | null>,
  updateSession: (session: ScanSession) => Promise<ScanSession>,
): Promise<void> {
  const session = await getSession(sessionId);
  if (!session) {
    json(response, 404, {
      ok: false,
      error: { code: "NOT_FOUND", message: "Scan session not found." },
    } satisfies ScanApiFailure);
    return;
  }

  if (session.status === "completed" || session.status === "failed") {
    json(response, 409, {
      ok: false,
      error: {
        code: "INVALID_REQUEST",
        message: "Completed scans cannot be cancelled.",
      },
    } satisfies ScanApiFailure);
    return;
  }

  const cancelled: ScanSession = {
    ...session,
    status: "cancelled",
    completedAt: new Date().toISOString(),
  };
  const updated = await updateSession(cancelled);
  json(response, 200, { ok: true, session: updated });
}

export async function handleScanArtifactGetRequest(
  response: ServerResponse,
  sessionId: string,
  artifactId: string,
  getSession: (id: string) => Promise<ScanSession | null>,
): Promise<void> {
  const session = await getSession(sessionId);
  const artifact = session?.artifacts.find((item) => item.id === artifactId);

  if (!artifact) {
    json(response, 404, {
      ok: false,
      error: { code: "NOT_FOUND", message: "Artifact not found." },
    } satisfies ScanApiFailure);
    return;
  }

  json(response, 200, { ok: true, artifact });
}

export async function handleScanRetestRequest(
  response: ServerResponse,
  sessionId: string,
  findingId: string,
  getSession: (id: string) => Promise<ScanSession | null>,
  startRetest: (sessionId: string, findingId: string) => Promise<ScanSession | null>,
): Promise<void> {
  const session = await getSession(sessionId);
  if (!session) {
    json(response, 404, { ok: false, error: { code: "NOT_FOUND", message: "Scan session not found." } } satisfies ScanApiFailure);
    return;
  }
  const finding = session.findings.find((item) => item.id === findingId);
  if (!finding) {
    json(response, 404, { ok: false, error: { code: "NOT_FOUND", message: "Finding not found." } } satisfies ScanApiFailure);
    return;
  }
  const retest = await startRetest(sessionId, findingId);
  if (!retest) {
    json(response, 409, { ok: false, error: { code: "INVALID_REQUEST", message: "Could not start the re-test." } } satisfies ScanApiFailure);
    return;
  }
  json(response, 202, { ok: true, session: retest, comparison: { findingId, before: finding, outcome: "not-found" } });
}


export async function handleWebsiteListRequest(
  response: ServerResponse,
  websites: Promise<import("./sessionTypes").WebsiteRef[]>,
): Promise<void> {
  const body: WebsiteListResponse = {
    ok: true,
    websites: await websites,
  };

  json(response, 200, body);
}
