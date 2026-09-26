import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createScanSession, updateScanSession } from "./session";
import { InMemoryScanSessionStore } from "./sessionStore";

describe("InMemoryScanSessionStore", () => {
  it("creates and retrieves sessions by id", async () => {
    const store = new InMemoryScanSessionStore();
    const session = createScanSession("https://example.com");

    await store.create(session);

    assert.deepEqual(await store.get(session.id), session);
  });

  it("rejects duplicate session ids", async () => {
    const store = new InMemoryScanSessionStore();
    const session = createScanSession("https://example.com");

    await store.create(session);

    await assert.rejects(store.create(session));
  });

  it("returns null for an unknown session", async () => {
    const store = new InMemoryScanSessionStore();

    assert.equal(await store.get("scan_missing"), null);
  });

  it("updates an existing session", async () => {
    const store = new InMemoryScanSessionStore();
    const session = createScanSession("https://example.com");

    await store.create(session);

    const updated = updateScanSession(session, {
      status: "completed",
      completedAt: "2026-09-20T10:00:00.000Z",
    });

    await store.update(updated);

    assert.deepEqual(await store.get(session.id), updated);
  });

  it("rejects updates for unknown sessions", async () => {
    const store = new InMemoryScanSessionStore();
    const session = createScanSession("https://example.com");

    await assert.rejects(store.update(session));
  });

  it("lists sessions newest first", async () => {
    const store = new InMemoryScanSessionStore();
    const older = createScanSession("https://older.example");
    const newer = createScanSession("https://newer.example");

    await store.create({
      ...older,
      id: older.id + "_older",
      createdAt: "2026-09-20T09:00:00.000Z",
    });
    await store.create({
      ...newer,
      id: newer.id + "_newer",
      createdAt: "2026-09-20T10:00:00.000Z",
    });

    const sessions = await store.list();

    assert.deepEqual(
      sessions.map((session) => session.id),
      [newer.id + "_newer", older.id + "_older"],
    );
  });
  it("filters history by canonical website key", async () => {
    const store = new InMemoryScanSessionStore();
    const example = { ...createScanSession("https://www.example.com/pricing"), id: "scan_example" };
    const other = { ...createScanSession("https://other.example"), id: "scan_other" };

    await store.create(example);
    await store.create(other);

    const sessions = await store.list("example.com:443");

    assert.deepEqual(sessions.map((session) => session.siteKey), ["example.com:443"]);
  });

  it("keeps different effective ports as separate websites", async () => {
    const store = new InMemoryScanSessionStore();
    const httpsSite = createScanSession("https://example.com");
    const stagingSite = createScanSession("http://example.com:8080");

    await store.create(httpsSite);
    await store.create(stagingSite);

    assert.equal(httpsSite.siteKey, "example.com:443");
    assert.equal(stagingSite.siteKey, "example.com:8080");
    assert.equal((await store.list("example.com:443")).length, 1);
    assert.equal((await store.list("example.com:8080")).length, 1);
  });

});
