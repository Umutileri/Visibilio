import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { after, before, describe, it } from "node:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { scanViewports } from "./viewportScan";

let server: Server;
let baseUrl: string;

before(async () => {
  server = createServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(`
      <!doctype html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; }
            .overflow-target { width: 424px; height: 80px; }
          </style>
        </head>
        <body><div class="overflow-target"></div></body>
      </html>
    `);
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

describe("scanViewports", () => {
  it("runs the configured viewport set", async () => {
    const evidenceDir = await mkdtemp(tmpdir() + "/visibilio-evidence-");
    try {
      const result = await scanViewports(`${baseUrl}/fixture`, undefined, { evidenceDir });

      assert.equal(result.results.length, 2);
      assert.equal(result.results[0]?.viewport.name, "Mobile");
      assert.equal(result.results[1]?.viewport.name, "Desktop");
      const paths = result.results.flatMap((scan) => (scan.ok ? [scan.screenshot.path] : []));
      assert.equal(paths.length, 2);
      assert.notEqual(paths[0], paths[1]);
      assert.ok(paths.every((path) => path.startsWith(evidenceDir)));
    } finally {
      await rm(evidenceDir, { recursive: true, force: true });
    }
  });
});
