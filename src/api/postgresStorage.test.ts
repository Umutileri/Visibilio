import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createScanSession, updateScanSession } from "./session";
import {
  PostgresScanSessionRepository,
  PostgresWebsiteRepository,
} from "./postgresStorage";

function mockPool(
  responses: Array<{ rows?: unknown[] }>,
): { queries: Array<{ text: string; values?: unknown[] }>; query: (text: string, values?: unknown[]) => Promise<{ rows: unknown[] }> } {
  const queries: Array<{ text: string; values?: unknown[] }> = [];
  return {
    queries,
    async query(text: string, values?: unknown[]) {
      queries.push({ text, values });
      return responses.shift() ?? { rows: [] };
    },
  };
}

describe("postgres repositories", () => {
  it("maps website records from postgres rows", async () => {
    const pool = mockPool([
      {
        rows: [
          {
            site_key: "example.com:443",
            name: "example.com",
            url: "https://example.com/",
            created_at: "2026-09-26T10:00:00.000Z",
            last_scan_at: "2026-09-26T10:01:00.000Z",
          },
        ],
      },
    ]);
    const store = new PostgresWebsiteRepository(pool as never);

    const website = await store.get("example.com:443");

    assert.deepEqual(website, {
      key: "example.com:443",
      name: "example.com",
      url: "https://example.com/",
      createdAt: "2026-09-26T10:00:00.000Z",
      lastScanAt: "2026-09-26T10:01:00.000Z",
    });
    assert.match(pool.queries[0].text, /WHERE site_key = $1/);
  });

  it("serializes and restores scan sessions including retest lineage", async () => {
    const session = updateScanSession(
      {
        ...createScanSession("https://example.com/"),
        parentSessionId: "scan_parent",
        retestOfFindingId: "finding_1",
      },
      {
        status: "completed",
        completedAt: "2026-09-26T10:02:00.000Z",
      },
    );
    const pool = mockPool([
      {
        rows: [
          {
            id: session.id,
            site_key: session.siteKey,
            url: session.url,
            site_name: session.siteName,
            parent_session_id: session.parentSessionId,
            retest_of_finding_id: session.retestOfFindingId,
            status: session.status,
            created_at: session.createdAt,
            started_at: session.startedAt ?? null,
            completed_at: session.completedAt,
            results: [],
            findings: [],
            artifacts: [],
          },
        ],
      },
    ]);
    const store = new PostgresScanSessionRepository(pool as never);

    const created = await store.create(session);

    assert.deepEqual(created, {
      ...session,
      startedAt: undefined,
    });
    const query = pool.queries[0];
    assert.match(query.text, /INSERT INTO scan_sessions/);
    assert.equal(query.values?.[0], session.id);
    assert.equal(query.values?.[4], "scan_parent");
    assert.equal(query.values?.[5], "finding_1");
  });
});
