import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { after, before, describe, it } from "node:test";
import { scanPage } from "./scanPage";
import { initialViewports } from "./viewports";

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
  await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

describe("scanPage", () => {
  it("detects horizontal overflow on the mobile viewport", async () => {
    const result = await scanPage(`${baseUrl}/fixture`, initialViewports[0]);

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.dimensions.viewportWidth, 390);
      assert.equal(result.dimensions.horizontalOverflow, 34);
    }
  });

  it("does not report overflow on the wider desktop viewport", async () => {
    const result = await scanPage(`${baseUrl}/fixture`, initialViewports[1]);

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.dimensions.viewportWidth, 1440);
      assert.equal(result.dimensions.horizontalOverflow, 0);
    }
  });
});
