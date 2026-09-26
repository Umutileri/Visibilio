import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { InMemoryWebsiteStore } from "./websiteStore";

describe("InMemoryWebsiteStore", () => {
  it("creates and retrieves a website", async () => {
    const store = new InMemoryWebsiteStore();
    const website = await store.upsert({
      key: "example.com:443",
      name: "example.com:443",
      url: "https://example.com",
      createdAt: "2026-09-26T10:00:00.000Z",
    });

    assert.deepEqual(await store.get("example.com:443"), website);
  });

  it("merges repeated scans without duplicating the website", async () => {
    const store = new InMemoryWebsiteStore();

    await store.upsert({
      key: "example.com:443",
      name: "example.com:443",
      url: "https://example.com",
      createdAt: "2026-09-26T10:00:00.000Z",
      lastScanAt: "2026-09-26T10:00:00.000Z",
    });

    await store.upsert({
      key: "example.com:443",
      name: "example.com:443",
      url: "https://example.com/pricing",
      lastScanAt: "2026-09-26T11:00:00.000Z",
    });

    const websites = await store.list();

    assert.equal(websites.length, 1);
    assert.equal(websites[0].key, "example.com:443");
    assert.equal(websites[0].url, "https://example.com/pricing");
    assert.equal(websites[0].createdAt, "2026-09-26T10:00:00.000Z");
    assert.equal(websites[0].lastScanAt, "2026-09-26T11:00:00.000Z");
  });

  it("orders websites by latest scan activity", async () => {
    const store = new InMemoryWebsiteStore();

    await store.upsert({
      key: "older.example",
      name: "older.example",
      url: "https://older.example",
      lastScanAt: "2026-09-26T09:00:00.000Z",
    });

    await store.upsert({
      key: "newer.example",
      name: "newer.example",
      url: "https://newer.example",
      lastScanAt: "2026-09-26T12:00:00.000Z",
    });

    assert.deepEqual(
      (await store.list()).map((website) => website.key),
      ["newer.example", "older.example"],
    );
  });
});
