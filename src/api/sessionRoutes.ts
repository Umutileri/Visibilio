import type { ServerResponse } from "node:http";
import type { ScanSession } from "./sessionTypes";
import type {
  ScanApiFailure,
  ScanSessionGetResponse,
  ScanSessionListResponse,\n  ScanFindingStatusResponse,
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
\nexport async function handleScanFindingStatusRequest(\n  response: ServerResponse,\n  sessionId: string,\n  findingId: string,\n  status: "open" | "resolved" | "ignored",\n  getSession: (id: string) => Promise<ScanSession | null>,\n  updateSession: (session: ScanSession) => Promise<ScanSession>,\n): Promise<void> {\n  const session = await getSession(sessionId);\n  if (!session) {\n    json(response, 404, { ok: false, error: { code: "NOT_FOUND", message: "Scan session not found." } } satisfies ScanApiFailure);\n    return;\n  }\n\n  const finding = session.findings.find((item) => item.id === findingId);\n  if (!finding) {\n    json(response, 404, { ok: false, error: { code: "NOT_FOUND", message: "Finding not found." } } satisfies ScanApiFailure);\n    return;\n  }\n\n  const nextFindings = session.findings.map((item) =>\n    item.id === findingId ? { ...item, status } : item,\n  );\n  const updated = await updateSession({ ...session, findings: nextFindings });\n  const body: ScanFindingStatusResponse = {\n    ok: true,\n    session: updated,\n    url: updated.url,\n    results: updated.results.map((scan) => ({ viewport: scan.viewport, scan })),\n  };\n  json(response, 200, body);\n}\n