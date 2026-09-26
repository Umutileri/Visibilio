import { Pool } from "pg";
import type { ScanSession, WebsiteRef } from "./sessionTypes";
import type { ScanSessionRepository, WebsiteRepository, VisibilioStorage } from "./storage";

type DatabaseRow = {
  site_key: string;
  name: string;
  url: string;
  created_at: Date | string;
  last_scan_at: Date | string | null;
};

type ScanRow = {
  id: string;
  site_key: string;
  url: string;
  site_name: string;
  parent_session_id: string | null;
  retest_of_finding_id: string | null;
  status: ScanSession["status"];
  created_at: Date | string;
  started_at: Date | string | null;
  completed_at: Date | string | null;
  results: ScanSession["results"];
  findings: ScanSession["findings"];
  artifacts: ScanSession["artifacts"];
};

function iso(value: Date | string | null): string | undefined {
  if (value === null) return undefined;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function websiteFromRow(row: DatabaseRow): WebsiteRef {
  return {
    key: row.site_key,
    name: row.name,
    url: row.url,
    createdAt: iso(row.created_at),
    lastScanAt: iso(row.last_scan_at),
  };
}

function sessionFromRow(row: ScanRow): ScanSession {
  return {
    id: row.id,
    url: row.url,
    siteKey: row.site_key,
    siteName: row.site_name,
    parentSessionId: row.parent_session_id ?? undefined,
    retestOfFindingId: row.retest_of_finding_id ?? undefined,
    status: row.status,
    createdAt: iso(row.created_at)!,
    startedAt: iso(row.started_at),
    completedAt: iso(row.completed_at),
    results: row.results ?? [],
    findings: row.findings ?? [],
    artifacts: row.artifacts ?? [],
  };
}

class PostgresWebsiteRepository implements WebsiteRepository {
  constructor(private readonly pool: Pool) {}

  async upsert(website: WebsiteRef): Promise<WebsiteRef> {
    const result = await this.pool.query<DatabaseRow>(
      `INSERT INTO websites (site_key, name, url, created_at, last_scan_at)
       VALUES ($1, $2, $3, COALESCE($4::timestamptz, NOW()), $5::timestamptz)
       ON CONFLICT (site_key) DO UPDATE SET
         name = EXCLUDED.name,
         url = EXCLUDED.url,
         last_scan_at = COALESCE(EXCLUDED.last_scan_at, websites.last_scan_at)
       RETURNING site_key, name, url, created_at, last_scan_at`,
      [website.key, website.name, website.url, website.createdAt ?? null, website.lastScanAt ?? null],
    );
    return websiteFromRow(result.rows[0]);
  }

  async get(key: string): Promise<WebsiteRef | null> {
    const result = await this.pool.query<DatabaseRow>(
      "SELECT site_key, name, url, created_at, last_scan_at FROM websites WHERE site_key = $1",
      [key],
    );
    return result.rows[0] ? websiteFromRow(result.rows[0]) : null;
  }

  async list(): Promise<WebsiteRef[]> {
    const result = await this.pool.query<DatabaseRow>(
      "SELECT site_key, name, url, created_at, last_scan_at FROM websites ORDER BY COALESCE(last_scan_at, created_at) DESC",
    );
    return result.rows.map(websiteFromRow);
  }
}

class PostgresScanSessionRepository implements ScanSessionRepository {
  constructor(private readonly pool: Pool) {}

  async create(session: ScanSession): Promise<ScanSession> {
    const result = await this.pool.query<ScanRow>(
      `INSERT INTO scan_sessions
        (id, site_key, url, site_name, parent_session_id, retest_of_finding_id, status,
         created_at, started_at, completed_at, results, findings, artifacts)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::timestamptz, $9::timestamptz, $10::timestamptz,
               $11::jsonb, $12::jsonb, $13::jsonb)
       RETURNING id, site_key, url, site_name, parent_session_id, retest_of_finding_id, status,
                 created_at, started_at, completed_at, results, findings, artifacts`,
      [
        session.id,
        session.siteKey,
        session.url,
        session.siteName,
        session.parentSessionId ?? null,
        session.retestOfFindingId ?? null,
        session.status,
        session.createdAt,
        session.startedAt ?? null,
        session.completedAt ?? null,
        JSON.stringify(session.results),
        JSON.stringify(session.findings),
        JSON.stringify(session.artifacts),
      ],
    );
    return sessionFromRow(result.rows[0]);
  }

  async get(id: string): Promise<ScanSession | null> {
    const result = await this.pool.query<ScanRow>(
      `SELECT id, site_key, url, site_name, parent_session_id, retest_of_finding_id, status,
              created_at, started_at, completed_at, results, findings, artifacts
       FROM scan_sessions WHERE id = $1`,
      [id],
    );
    return result.rows[0] ? sessionFromRow(result.rows[0]) : null;
  }

  async update(session: ScanSession): Promise<ScanSession> {
    const result = await this.pool.query<ScanRow>(
      `UPDATE scan_sessions
       SET site_key = $2,
           url = $3,
           site_name = $4,
           parent_session_id = $5,
           retest_of_finding_id = $6,
           status = $7,
           created_at = $8::timestamptz,
           started_at = $9::timestamptz,
           completed_at = $10::timestamptz,
           results = $11::jsonb,
           findings = $12::jsonb,
           artifacts = $13::jsonb
       WHERE id = $1
       RETURNING id, site_key, url, site_name, parent_session_id, retest_of_finding_id, status,
                 created_at, started_at, completed_at, results, findings, artifacts`,
      [
        session.id,
        session.siteKey,
        session.url,
        session.siteName,
        session.parentSessionId ?? null,
        session.retestOfFindingId ?? null,
        session.status,
        session.createdAt,
        session.startedAt ?? null,
        session.completedAt ?? null,
        JSON.stringify(session.results),
        JSON.stringify(session.findings),
        JSON.stringify(session.artifacts),
      ],
    );
    if (!result.rows[0]) throw new Error("Cannot update an unknown scan session.");
    return sessionFromRow(result.rows[0]);
  }

  async list(siteKey?: string): Promise<ScanSession[]> {
    const result = await this.pool.query<ScanRow>(
      `SELECT id, site_key, url, site_name, parent_session_id, retest_of_finding_id, status,
              created_at, started_at, completed_at, results, findings, artifacts
       FROM scan_sessions
       WHERE ($1::text IS NULL OR site_key = $1)
       ORDER BY created_at DESC`,
      [siteKey ?? null],
    );
    return result.rows.map(sessionFromRow);
  }
}

export function createPostgresStorage(databaseUrl: string): VisibilioStorage & { pool: Pool } {
  const pool = new Pool({ connectionString: databaseUrl });
  return {
    pool,
    websites: new PostgresWebsiteRepository(pool),
    scans: new PostgresScanSessionRepository(pool),
  };
}
