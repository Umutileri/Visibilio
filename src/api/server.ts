import { createServer, type ServerResponse } from "node:http";
import { handleScanRequest } from "./handleScanRequest";
import {
  handleScanSessionGetRequest,
  handleScanSessionListRequest,
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
