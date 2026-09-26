import type { ServerResponse } from "node:http";
import type { VisibilioStorage } from "./storage";
import type { FindingExplanation, ExplanationProvider } from "./explanation";
import type { ScanApiFailure } from "./types";

function json(response: ServerResponse, statusCode: number, body: unknown): void {
  response.writeHead(statusCode, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

export async function handleFindingExplanationRequest(
  response: ServerResponse,
  storage: VisibilioStorage,
  sessionId: string,
  findingId: string,
  provider: ExplanationProvider,
): Promise<void> {
  const session = await storage.scans.get(sessionId);
  if (!session) {
    json(response, 404, {
      ok: false,
      error: { code: "NOT_FOUND", message: "Scan session not found." },
    } satisfies ScanApiFailure);
    return;
  }

  const finding = session.findings.find((item) => item.id === findingId);
  if (!finding) {
    json(response, 404, {
      ok: false,
      error: { code: "NOT_FOUND", message: "Finding not found." },
    } satisfies ScanApiFailure);
    return;
  }

  try {
    const explanation = await provider.explain({
      finding,
      evidence: finding.evidence,
    });

    if (explanation.findingId !== finding.id) {
      throw new Error("Explanation provider returned a mismatched finding id.");
    }

    const body: { ok: true; explanation: FindingExplanation } = {
      ok: true,
      explanation,
    };
    json(response, 200, body);
  } catch {
    json(response, 502, {
      ok: false,
      error: {
        code: "SCAN_ERROR",
        message: "Could not generate a finding explanation.",
      },
    } satisfies ScanApiFailure);
  }
}
