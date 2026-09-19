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
});

describe("scanPage", () => {
  it("detects mobile overflow and emits a structured issue", async () => {
    const result = await scanPage(`${baseUrl}/fixture`, initialViewports[0]);

    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.equal(result.dimensions.viewportWidth, 390);
    assert.equal(result.dimensions.horizontalOverflow, 34);

    const overflowIssue = result.issues.find(
      (issue) => issue.rule === "responsive.horizontal-overflow",
    );
    assert.ok(overflowIssue);
    assert.equal(overflowIssue.severity, "medium");
    assert.equal(overflowIssue.selector, ".overflow-target");
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
    const result = await scanPage(`${baseUrl}/fixture`, initialViewports[0]);

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
          issue.selector === "#missing-name",
      ),
    );
  });

  it("does not report overflow on the wider desktop viewport", async () => {
    const result = await scanPage(`${baseUrl}/fixture`, initialViewports[1]);

    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.equal(result.dimensions.viewportWidth, 1440);
    assert.equal(result.dimensions.horizontalOverflow, 0);
  });

  it("returns a page failure for an unreachable page", async () => {
    const result = await scanPage("http://127.0.0.1:1/unreachable", {
      name: "Test",
      width: 390,
      height: 844,
    });

    assert.equal(result.ok, false);
    assert.notEqual(result.ok, true);
    if (!result.ok) return;
    assert.fail("Expected page failure, but scanPage returned success");
  });
});
