import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { access, rm } from "node:fs/promises";
import { after, before, describe, it } from "node:test";
import { scanPage } from "./scanPage";
import { initialViewports } from "./viewports";

let server: Server;
let baseUrl: string;
const evidenceDir = ".test-evidence";

before(async () => {
  server = createServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(`
      <!doctype html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Scanner fixture</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; }
            .overflow-target { width: 424px; height: 80px; }
          </style>
        </head>
        <body>
          <img
            id="missing-alt"
            src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
          />
          <input id="missing-name" />
          <div class="overflow-target"></div>
        </body>
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
  await rm(evidenceDir, { recursive: true, force: true });
});

describe("scanPage", () => {
  it("detects mobile overflow and emits a structured issue", async () => {
    const result = await scanPage(`${baseUrl}/fixture`, initialViewports[0], {
      evidenceDir,
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.equal(result.dimensions.viewportWidth, 390);
    assert.equal(result.dimensions.horizontalOverflow, 34);
    assert.equal(result.screenshot.type, "screenshot");
    assert.equal(result.screenshot.format, "png");
    assert.deepEqual(result.screenshot.viewport, initialViewports[0]);
    assert.equal(result.screenshot.width, 390);
    assert.equal(result.screenshot.height, 844);
    await access(result.screenshot.path);

    const overflowIssue = result.issues.find(
      (issue) => issue.rule === "responsive.horizontal-overflow",
    );
    assert.ok(overflowIssue);
    assert.equal(overflowIssue.severity, "medium");
    assert.deepEqual(overflowIssue.evidence, [
      {
        type: "measurement",
        metric: "horizontalOverflow",
        value: 34,
        unit: "px",
      },
    ]);
  });

  it("reports deterministic accessibility findings", async () => {
    const result = await scanPage(`${baseUrl}/fixture`, initialViewports[0], {
      evidenceDir,
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;

    const rules = result.issues.map((issue) => issue.rule);
    assert.ok(rules.includes("accessibility.image-missing-alt"));
    assert.ok(rules.includes("accessibility.form-control-name"));
    assert.ok(rules.includes("accessibility.html-lang"));

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.rule === "accessibility.image-missing-alt" &&
          issue.selector === "img#missing-alt",
      ),
    );
    assert.ok(
      result.issues.some(
        (issue) =>
          issue.rule === "accessibility.form-control-name" &&
          issue.selector === "input#missing-name",
      ),
    );
  });

  it("does not report overflow on the wider desktop viewport", async () => {
    const result = await scanPage(`${baseUrl}/fixture`, initialViewports[1], {
      evidenceDir,
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.equal(result.dimensions.viewportWidth, 1440);
    assert.equal(result.dimensions.horizontalOverflow, 0);
    assert.equal(result.screenshot.width, 1440);
    assert.equal(result.screenshot.height, 900);
  });

  it("blocks navigation to a private redirect target", async () => {
    const redirectServer = createServer((_request, response) => {
      response.writeHead(302, { location: "http://127.0.0.1:1/private" });
      response.end();
    });

    await new Promise<void>((resolve) => redirectServer.listen(0, "127.0.0.1", resolve));
    const address = redirectServer.address();
    assert.ok(address && typeof address !== "string");

    try {
      const result = await scanPage(`http://127.0.0.1:${address.port}/redirect`, initialViewports[0], { evidenceDir });
      assert.equal(result.ok, false);
    } finally {
      await new Promise<void>((resolve, reject) => redirectServer.close((error) => (error ? reject(error) : resolve())));
    }
  });
  it("returns a page failure for an unreachable page", async () => {
    const result = await scanPage(
      "http://127.0.0.1:1/unreachable",
      { name: "Test", width: 390, height: 844 },
      { evidenceDir },
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.error);
      assert.equal("screenshot" in result, false);
    }
  });
});
