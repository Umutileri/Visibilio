import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createScanHandlers } from "./handleScanRequest";
import {
  handleScanSessionGetRequest,
  handleScanSessionListRequest,
  handleScanFindingStatusRequest,
  handleScanSessionStartRequest,
  handleScanSessionCancelRequest,
  handleScanArtifactGetRequest,
  handleScanRetestRequest,
  handleWebsiteListRequest,
} from "./sessionRoutes";
import { createStorageFromEnv } from "./storageFactory";
import type { VisibilioStorage } from "./storage";

async function handleFindingStatusRoute(
  request: IncomingMessage,
  response: ServerResponse,
  sessionId: string,
  findingId: string,
): Promise<void> {
  let body = "";
  for await (const chunk of request) {
    body += chunk.toString();
    if (body.length > MAX_REQUEST_BODY_BYTES) {
      response.writeHead(413, { "content-type": "application/json" });
      response.end(JSON.stringify({ ok: false, error: { code: "INVALID_REQUEST", message: "Request body is too large." } }));
      return;
    }
  }
  try {
    const payload = JSON.parse(body) as { status?: unknown };
    if (payload.status !== "open" && payload.status !== "resolved" && payload.status !== "ignored") {
      response.writeHead(400, { "content-type": "application/json" });
      response.end(JSON.stringify({ ok: false, error: { code: "INVALID_REQUEST", message: "Status must be open, resolved, or ignored." } }));
      return;
    }
    await handleScanFindingStatusRequest(
      response,
      sessionId,
      findingId,
      payload.status,
      (id) => defaultStorage.scans.get(id),
      (session) => defaultStorage.scans.update(session),
    );
  } catch {
    response.writeHead(400, { "content-type": "application/json" });
    response.end(JSON.stringify({ ok: false, error: { code: "INVALID_REQUEST", message: "Request body must be valid JSON." } }));
  }
}

function writeNotFound(response: ServerResponse): void {
  response.writeHead(404, { "content-type": "application/json" });
  response.end(JSON.stringify({ ok: false, error: { code: "NOT_FOUND", message: "Route not found." } }));
}


const port = Number(process.env.PORT ?? 8787);
const MAX_REQUEST_BODY_BYTES = 32_000;

async function startServer(): Promise<void> {
  const defaultStorage: VisibilioStorage = await createStorageFromEnv();
  const defaultScanSessionStore = defaultStorage.scans;
  const defaultWebsiteStore = defaultStorage.websites;
  const { handleScanRequest, createScanSessionRequest, createRetestSessionRequest } = createScanHandlers(defaultStorage);

  createServer(async (request, response) => {

  const pathname = request.url
    ? new URL(request.url, "http://127.0.0.1").pathname
    : "";

  if (pathname === "/api/scan") {
    void handleScanRequest(request, response);
    return;
  }

  if (pathname === "/api/scans" && request.method === "POST") {
    let body = "";
    for await (const chunk of request) {
      body += chunk.toString();
      if (body.length > MAX_REQUEST_BODY_BYTES) {
        response.writeHead(413, { "content-type": "application/json" });
        response.end(
          JSON.stringify({
            ok: false,
            error: {
              code: "INVALID_REQUEST",
              message: "Request body is too large.",
            },
          }),
        );
        return;
      }
    }

    try {
      const payload = JSON.parse(body) as { url?: unknown };
      if (typeof payload.url !== "string") {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({
          ok: false,
          error: { code: "INVALID_REQUEST", message: "A URL string is required." },
        }));
        return;
      }

      const session = await createScanSessionRequest(payload.url);
      if (!session) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({
          ok: false,
          error: { code: "INVALID_URL", message: "Use a valid HTTP or HTTPS URL without embedded credentials." },
        }));
        return;
      }

      await handleScanSessionStartRequest(response, session);
    } catch (error) {
      response.writeHead(400, { "content-type": "application/json" });
      response.end(JSON.stringify({
        ok: false,
        error: {
          code: "INVALID_URL",
          message: error instanceof Error ? error.message : "The requested target is not allowed.",
        },
      }));
    }
    return;
  }


  if (pathname === "/api/scans" && request.method === "GET") {
    const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
    const siteKey = requestUrl.searchParams.get("site") || undefined;
    void handleScanSessionListRequest(response, defaultScanSessionStore.list(siteKey));
    return;
  }

  if (pathname === "/api/websites" && request.method === "GET") {
    void handleWebsiteListRequest(response, defaultWebsiteStore.list());
    return;
  }

  const sessionMatch = pathname.match(/^\/api\/scans\/([^/]+)$/);
  const findingMatch = pathname.match(/^\/api\/scans\/([^/]+)\/findings\/([^/]+)$/);
  const artifactMatch = pathname.match(/^\/api\/scans\/([^/]+)\/artifacts\/([^/]+)$/);
  const retestMatch = pathname.match(/^\/api\/scans\/([^/]+)\/retest$/);

  if (findingMatch && request.method === "PATCH") {
    void handleFindingStatusRoute(
      request,
      response,
      decodeURIComponent(findingMatch[1]),
      decodeURIComponent(findingMatch[2]),
    );
    return;
  }

  if (retestMatch && request.method === "POST") {
    let body = "";
    for await (const chunk of request) body += chunk.toString();
    try {
      const payload = JSON.parse(body) as { findingId?: unknown };
      if (typeof payload.findingId !== "string" || !payload.findingId) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ ok: false, error: { code: "INVALID_REQUEST", message: "A findingId string is required." } }));
        return;
      }
      await handleScanRetestRequest(
        response,
        decodeURIComponent(retestMatch[1]),
        payload.findingId,
        (id) => defaultScanSessionStore.get(id),
        (sessionId, findingId) => createRetestSessionRequest(sessionId, findingId),
      );
    } catch {
      response.writeHead(400, { "content-type": "application/json" });
      response.end(JSON.stringify({ ok: false, error: { code: "INVALID_REQUEST", message: "Request body must be valid JSON." } }));
    }
    return;
  }

  if (artifactMatch && request.method === "GET") {
    void handleScanArtifactGetRequest(
      response,
      decodeURIComponent(artifactMatch[1]),
      decodeURIComponent(artifactMatch[2]),
      (id) => defaultScanSessionStore.get(id),
    );
    return;
  }

  if (sessionMatch && request.method === "GET") {
    void handleScanSessionGetRequest(
      response,
      decodeURIComponent(sessionMatch[1]),
      (id) => defaultScanSessionStore.get(id),
    );
    return;
  }

  if (sessionMatch && request.method === "DELETE") {
    void handleScanSessionCancelRequest(
      response,
      decodeURIComponent(sessionMatch[1]),
      (id) => defaultScanSessionStore.get(id),
      (session) => defaultScanSessionStore.update(session),
    );
    return;
  }

  writeNotFound(response);
}).listen(port, "127.0.0.1", () => {
  console.log("Visibilio scan API listening on 127.0.0.1:" + port);
});

}

void startServer().catch((error) => {
  console.error(
    "Visibilio scan API failed to start:",
    error instanceof Error ? error.message : error,
  );
  process.exitCode = 1;
});
