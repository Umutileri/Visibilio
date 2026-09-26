import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createStorageFromEnv } from "./storageFactory";

describe("storage factory", () => {
  it("creates isolated in-memory storage when no database is configured", async () => {
    const storage = await createStorageFromEnv({});
    assert.ok(storage.websites);
    assert.ok(storage.scans);
    assert.equal("pool" in storage, false);
  });

  it("requires DATABASE_URL for postgres mode", async () => {
    await assert.rejects(
      createStorageFromEnv({ VISIBILIO_STORAGE: "postgres" }),
      /requires DATABASE_URL/,
    );
  });

  it("rejects unsupported storage modes", async () => {
    await assert.rejects(
      createStorageFromEnv({ VISIBILIO_STORAGE: "sqlite" }),
      /Unsupported VISIBILIO_STORAGE mode/,
    );
  });
});
