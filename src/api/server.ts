import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createScanSessionRequest, handleScanRequest } from "./handleScanRequest";
import {
  handleScanSessionGetRequest,
  handleScanSessionListRequest,
  handleScanFindingStatusRequest,
  handleScanSessionStartRequest,
} from "./sessionRoutes";
import { defaultScanSessionStore } from "./sessionStore";

const port = Number(process.env.PORT ?? 8787);

function writeNotFound(response: ServerResponse): void {
  response.writeHead(404, { "content-type": "application/json" });
  response.end(
    JSON.stringify({
      ok: false,
      error: { code: "NOT_FOUND", message: "Route not found." },
    }),
  );
}

async function handleFindingStatusRoute(
  request: IncomingMessage,
  response: ServerResponse,
  sessionId: string,
  findingId: string,
): Promise<void> {
  let body = "";
  for await (const chunk of request) body += chunk.toString();

  try {
    const payload = JSON.parse(body) as { status?: string };
    if (!payload.status || !["open", "resolved", "ignored"].includes(payload.status)) {
      response.writeHead(400, { "content-type": "application/json" });
      response.end(
        JSON.stringify({
          ok: false,
          error: {
            code: "INVALID_STATUS",
            message: "Status must be open, resolved, or ignored.",
          },
        }),
      );
      return;
    }

    await handleScanFindingStatusRequest(
      response,
      sessionId,
      findingId,
      payload.status as "open" | "resolved" | "ignored",
      (id) => defaultScanSessionStore.get(id),
      (session) => defaultScanSessionStore.update(session),
    );
  } catch {
    response.writeHead(400, { "content-type": "application/json" });
    response.end(
      JSON.stringify({
        ok: false,
        error: {
          code: "INVALID_REQUEST",
          message: "Request body must be valid JSON.",
        },
      }),
    );
  }
}

createServer((request, response) => {
  const pathname = request.url
    ? new URL(request.url, "http://127.0.0.1").pathname
    : "";

  if (pathname === "/api/scan") {
    void handleScanRequest(request, response);
    return;
  }

  if (pathname === "/api/scans" && request.method === "POST") {
    let body = "";
    for await (const chunk of request) body += chunk.toString();

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
    void handleScanSessionListRequest(response, defaultScanSessionStore.list());
    return;
  }

  const sessionMatch = pathname.match(/^\/api\/scans\/([^/]+)$/);
  const findingMatch = pathname.match(/^\/api\/scans\/([^/]+)\/findings\/([^/]+)$/);

  if (findingMatch && request.method === "PATCH") {
    void handleFindingStatusRoute(
      request,
      response,
      decodeURIComponent(findingMatch[1]),
      decodeURIComponent(findingMatch[2]),
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

  writeNotFound(response);
}).listen(port, "127.0.0.1", () => {
  console.log("Visibilio scan API listening on 127.0.0.1:" + port);
});
