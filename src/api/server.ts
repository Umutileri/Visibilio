import { createServer } from "node:http";
import { handleScanRequest } from "./handleScanRequest";

const port = Number(process.env.PORT ?? 8787);

createServer((request, response) => {
  if (request.url !== "/api/scan") {
    response.writeHead(404, { "content-type": "application/json" });
    response.end(
      JSON.stringify({
        ok: false,
        error: { code: "NOT_FOUND", message: "Route not found." },
      }),
    );
    return;
  }

  void handleScanRequest(request, response);
}).listen(port, "127.0.0.1", () => {
  console.log("Visibilio scan API listening on 127.0.0.1:" + port);
});
