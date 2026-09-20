import { createServer, type ServerResponse } from "node:http";
import { handleScanRequest } from "./handleScanRequest";
import {
  handleScanSessionGetRequest,
  handleScanSessionListRequest,\n  handleScanFindingStatusRequest,
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

createServer((request, response) => {
  const pathname = request.url ? new URL(request.url, "http://127.0.0.1").pathname : "";

  if (pathname === "/api/scan") {
    void handleScanRequest(request, response);
    return;
  }

  if (pathname === "/api/scans" && request.method === "GET") {
    void handleScanSessionListRequest(
      response,
      defaultScanSessionStore.list(),
    );
    return;
  }

  const sessionMatch = pathname.match(/^\/api\/scans\/([^/]+)$/);

  const findingMatch = pathname.match(/^\\/api\\/scans\\/([^/]+)\\/findings\\/([^/]+)$/);\n\n  if (findingMatch && request.method === "PATCH") {\n    let body = "";\n    for await (const chunk of request) body += chunk.toString();\n    try {\n      const payload = JSON.parse(body) as { status?: string };\n      if (!payload.status || !["open", "resolved", "ignored"].includes(payload.status)) {\n        response.writeHead(400, { "content-type": "application/json" });\n        response.end(JSON.stringify({ ok: false, error: { code: "INVALID_STATUS", message: "Status must be open, resolved, or ignored." } }));\n        return;\n      }\n      await handleScanFindingStatusRequest(response, decodeURIComponent(findingMatch[1]), decodeURIComponent(findingMatch[2]), payload.status as "open" | "resolved" | "ignored", (id) => defaultScanSessionStore.get(id), (session) => defaultScanSessionStore.update(session));\n    } catch {\n      response.writeHead(400, { "content-type": "application/json" });\n      response.end(JSON.stringify({ ok: false, error: { code: "INVALID_REQUEST", message: "Request body must be valid JSON." } }));\n    }\n    return;\n  }\n\n  if (sessionMatch && request.method === "GET") {
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
