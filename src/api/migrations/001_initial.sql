-- Visibilio persistence schema
CREATE TABLE IF NOT EXISTS websites (
  site_key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  last_scan_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS scan_sessions (
  id TEXT PRIMARY KEY,
  site_key TEXT NOT NULL REFERENCES websites(site_key) ON UPDATE CASCADE,
  url TEXT NOT NULL,
  site_name TEXT NOT NULL,
  parent_session_id TEXT REFERENCES scan_sessions(id) ON DELETE SET NULL,
  retest_of_finding_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('queued', 'scanning', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  results JSONB NOT NULL DEFAULT '[]'::jsonb,
  findings JSONB NOT NULL DEFAULT '[]'::jsonb,
  artifacts JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS scan_sessions_site_created_idx
  ON scan_sessions (site_key, created_at DESC);
