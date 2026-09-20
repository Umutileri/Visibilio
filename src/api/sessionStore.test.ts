import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createScanSession } from "./session";
import { InMemoryScanSessionStore } from "./sessionStore";

describe("InMemoryScanSessionStore", () => {
  it("creates and retrieves sessions by id", async () => {
    const store = new InMemoryScanSessionStore();
    const session = createScanSession("https://example.com");

    await store.create(session);

    assert.deepEqual(await store.get(session.id), session);
  });

  it("returns null for an unknown session", async () => {
    const store = new InMemoryScanSessionStore();

    assert.equal(await store.get("scan_missing"), null);
  });

  it("lists sessions newest first", async () => {
    const store = new InMemoryScanSessionStore();
    const older = createScanSession("https://older.example");
    const newer = createScanSession("https://newer.example");

    await store.create({
      ...older,
      createdAt: "2026-09-20T09:00:00.000Z",
    });
    await store.create({
      ...newer,
      createdAt: "2026-09-20T10:00:00.000Z",
    });

    const sessions = await store.list();

    assert.deepEqual(
      sessions.map((session) => session.id),
      [newer.id, older.id],
    );
  });
});
