import type {
  IssueSeverity,
  UIssue,
  ScanResult,
  ScanSuccess,
} from "./scanner/types";
import type { ScanApiResponse, ScanRetestResponse, ScanSessionGetResponse, ScanSessionListResponse, ScanSessionStartResponse } from "./api/types";
import type { ScanArtifact } from "./api/sessionTypes";
import { useEffect, useMemo, useRef, useState } from "react";

type AppSection =
  | "overview"
  | "analyze"
  | "findings"
  | "history"
  | "settings";

const sections: Array<{ id: AppSection; label: string; key: string }> = [
  { id: "overview", label: "Overview", key: "01" },
  { id: "analyze", label: "Analyze", key: "02" },
  { id: "findings", label: "Findings", key: "03" },
  { id: "history", label: "History", key: "04" },
  { id: "settings", label: "Settings", key: "05" },
];

const sampleFindings: UIssue[] = [
  {
    id: "sample-overflow",
    rule: "responsive.horizontal-overflow",
    category: "responsive",
    title: "Content exceeds the mobile viewport",
    severity: "medium",
    description:
      "The document is 34px wider than the tested 390px viewport, which can create horizontal scrolling.",
    url: "https://example.com",
    viewport: { name: "Mobile", width: 390, height: 844 },
    selector: ".pricing-grid",
    measurements: { viewportWidth: 390, documentWidth: 424, horizontalOverflow: 34 },
    evidence: [
      {
        type: "measurement",
        metric: "horizontalOverflow",
        value: 34,
        unit: "px",
      },
    ],
    detectedAt: "2026-09-20T00:00:00.000Z",
    status: "open",
  },
];

function sectionFromHash(): AppSection {
  const value = window.location.hash.replace("#app/", "").split("?")[0] as AppSection;
  if (value === "evidence") return "findings";
  return sections.some((section) => section.id === value) ? value : "overview";
}

function displayHostname(value: string): string {
  if (!value) return "Choose a website";
  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
}

function flattenResults(
  results: Array<{ viewport: { name: string }; scan: ScanResult }>,
): UIssue[] {
  return results.flatMap(({ scan }) => (scan.ok ? scan.issues : []));
}

function severityCount(findings: UIssue[], severity: IssueSeverity): number {
  return findings.filter((issue) => issue.severity === severity).length;
}

function statusLabel(scan: ScanSuccess | null): string {
  if (!scan) return "No scan yet";
  return scan.issues.length ? "Needs attention" : "No findings";
}

function ShellLogo() {
  return (
    <img
      className="saas-shell-logo"
      src="/Visibilio/visibilio-icon.svg"
      alt=""
      aria-hidden="true"
    />
  );
}

function AppShell() {
  const [section, setSection] = useState<AppSection>(sectionFromHash());
  const [focusedFindingId, setFocusedFindingId] = useState<string | null>(() => { const hash = window.location.hash; const query = hash.includes("?") ? hash.slice(hash.indexOf("?") + 1) : ""; return new URLSearchParams(query).get("finding"); });
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [activeScanSessionId, setActiveScanSessionId] = useState<string | null>(null);
  const [scanStage, setScanStage] = useState<"idle" | "loading" | "desktop" | "mobile" | "checks" | "done">("idle");
  const scanAbortRef = useRef<AbortController | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<ScanApiResponse | null>(null);
  const [history, setHistory] = useState<ScanSessionListResponse | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<"all" | IssueSeverity>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | UIssue["status"]>("all");
  const [retestSessionId, setRetestSessionId] = useState<string | null>(null);
  const [retestBusy, setRetestBusy] = useState(false);
  const [retestComparison, setRetestComparison] = useState<ScanRetestResponse | null>(null);

  useEffect(() => {
    const pendingUrl = window.sessionStorage.getItem("visibilio-pending-url");
    if (!pendingUrl) return;
    setUrl(pendingUrl);
    window.sessionStorage.removeItem("visibilio-pending-url");
  }, []);

  useEffect(() => {
    const onHash = () => {
      setSection(sectionFromHash());
      const hash = window.location.hash;
      const query = hash.includes("?") ? hash.slice(hash.indexOf("?") + 1) : "";
      setFocusedFindingId(new URLSearchParams(query).get("finding"));
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const scanResults = useMemo(() => (response?.ok ? response.results : []), [response]);

  useEffect(() => {
    const endpoint = import.meta.env.VITE_SCAN_API_URL;
    if (!endpoint) return;

    let cancelled = false;

    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const result = await fetch(endpoint.replace(/\/$/, "") + "/api/scans");
        const data = (await result.json()) as ScanSessionListResponse;
        if (!cancelled) setHistory(data);
      } catch {
        if (!cancelled) {
          setHistory({
            ok: false,
            error: {
              code: "SCAN_ERROR",
              message: "Could not load scan history.",
            },
          });
        }
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };

    void loadHistory();
    return () => {
      cancelled = true;
    };
  }, []);
  const findings = useMemo(() => flattenResults(scanResults), [scanResults]);

  useEffect(() => {
    if (!focusedFindingId) return;
    if (findings.some((finding) => finding.id === focusedFindingId)) {
      setSelectedFindingId(focusedFindingId);
    }
  }, [focusedFindingId, findings]);
  const selectedFinding =
    findings.find((finding) => finding.id === selectedFindingId) ??
    findings[0] ??
    sampleFindings[0];

  const selectedArtifact: ScanArtifact | null = response?.ok
    ? response.session.artifacts.find(
        (artifact) =>
          artifact.id.includes(selectedFinding.viewport.width + "x" + selectedFinding.viewport.height),
      ) ?? null
    : null;

  async function runRetest() {
    const endpoint = import.meta.env.VITE_SCAN_API_URL;
    const currentResponse = response;
    if (!endpoint || !currentResponse?.ok) return;

    setRetestBusy(true);
    setRetestComparison(null);
    setError("");

    try {
      const startResponse = await fetch(
        endpoint.replace(/\/$/, "") + "/api/scans/" + encodeURIComponent(currentResponse.session.id) + "/retest",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ findingId: selectedFinding.id }),
        },
      );
      const startData = (await startResponse.json()) as ScanRetestResponse;
      if (!startResponse.ok || !startData.ok) {
        throw new Error(startData.ok ? "Could not start re-test." : startData.error.message);
      }

      setRetestSessionId(startData.session.id);
      setUrl(startData.session.url);

      const poll = async (): Promise<void> => {
        const pollResponse = await fetch(
          endpoint.replace(/\/$/, "") + "/api/scans/" + encodeURIComponent(startData.session.id),
        );
        const pollData = (await pollResponse.json()) as ScanSessionGetResponse;
        if (!pollResponse.ok || !pollData.ok) {
          throw new Error(pollData.ok ? "Could not read re-test progress." : pollData.error.message);
        }

        if (pollData.session.status === "scanning" || pollData.session.status === "queued") {
          window.setTimeout(() => void poll().catch((error) => setError(error instanceof Error ? error.message : "Could not read re-test progress.")), 700);
          return;
        }

        const comparison = pollData.session.findings.find((finding) => finding.rule === selectedFinding.rule && finding.viewport.width === selectedFinding.viewport.width && finding.viewport.height === selectedFinding.viewport.height && finding.selector === selectedFinding.selector);
        setRetestComparison({
          ok: true,
          session: pollData.session,
          comparison: {
            findingId: selectedFinding.id,
            before: selectedFinding,
            after: comparison,
            outcome: comparison ? "still-present" : "resolved",
          },
        });
        setResponse({
          ok: true,
          session: pollData.session,
          url: pollData.session.url,
          results: pollData.session.results.map((scan) => ({ viewport: scan.viewport, scan })),
        });
        setRetestSessionId(null);
      };

      await poll();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not run re-test.");
    } finally {
      setRetestBusy(false);
    }
  }

  async function updateFindingStatus(status: UIssue["status"]) {
    const endpoint = import.meta.env.VITE_SCAN_API_URL;
    if (!endpoint || !response?.ok) return;
    try {
      const result = await fetch(endpoint.replace(/\/$/, "") + "/api/scans/" + encodeURIComponent(response.session.id) + "/findings/" + encodeURIComponent(selectedFinding.id), {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await result.json()) as ScanApiResponse;
      if (!result.ok || !data.ok) throw new Error(data.ok ? "Could not update finding." : data.error.message);
      setResponse(data);
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Could not update finding.");
    }
  }

  const filteredFindings = findings.filter((finding) => {
    const matchesSeverity = severity === "all" || finding.severity === severity;
    const needle = query.trim().toLowerCase();
    const matchesQuery =
      !needle ||
      finding.title.toLowerCase().includes(needle) ||
      finding.rule.toLowerCase().includes(needle) ||
      finding.selector?.toLowerCase().includes(needle);
    const matchesStatus = statusFilter === "all" || finding.status === statusFilter;
    return matchesSeverity && matchesQuery && matchesStatus;
  });

  async function runScan() {
    setError("");
    setIsScanning(true);
    setResponse(null);
    setScanStage("loading");

    const endpoint = import.meta.env.VITE_SCAN_API_URL;
    if (!endpoint) {
      setError("VITE_SCAN_API_URL is not configured. Connect the app to the scan API to run a live audit.");
      setIsScanning(false);
      return;
    }

    scanAbortRef.current?.abort();
    const controller = new AbortController();
    scanAbortRef.current = controller;

    try {
      const responseFromApi = await fetch(endpoint.replace(/\/$/, "") + "/api/scans", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });
      const data = (await responseFromApi.json()) as ScanSessionStartResponse;
      if (!responseFromApi.ok || !data.ok) {
        throw new Error(data.ok ? "Could not start scan." : data.error.message);
      }

      setActiveScanSessionId(data.session.id);
      setScanStage("loading");

      const poll = async (): Promise<void> => {
        try {
          const pollResponse = await fetch(endpoint.replace(/\/$/, "") + "/api/scans/" + encodeURIComponent(data.session.id), { signal: controller.signal });
          const pollData = (await pollResponse.json()) as ScanSessionGetResponse;
          if (!pollResponse.ok || !pollData.ok) {
            throw new Error(pollData.ok ? "Could not read scan progress." : pollData.error.message);
          }

          const session = pollData.session;
          const progressIndex = session.results.length;
          if (session.status === "scanning") {
            setScanStage(progressIndex === 0 ? "desktop" : "mobile");
          }
          if (session.status === "completed") {
            setScanStage("done");
            setResponse({
              ok: true,
              session,
              url: session.url,
              results: session.results.map((scan) => ({ viewport: scan.viewport, scan })),
            });
            setSelectedFindingId(session.findings[0]?.id ?? null);
            setIsScanning(false);
            setActiveScanSessionId(null);
            scanAbortRef.current = null;
            scanTimerRef.current = null;
            window.location.hash = "#app/findings" + (session.findings[0] ? "?finding=" + encodeURIComponent(session.findings[0].id) : "");
            return;
          }

          if (session.status === "cancelled") {
            setIsScanning(false);
            setActiveScanSessionId(null);
            setScanStage("idle");
            setError("Scan cancelled.");
            scanAbortRef.current = null;
            return;
          }

          if (session.status === "failed") {
            throw new Error("Scan failed. The target may be unavailable or blocked by the scan safety boundary.");
          }

          scanTimerRef.current = window.setTimeout(() => void poll(), 700);
        } catch (pollError) {
          if (pollError instanceof Error && pollError.name === "AbortError") return;
          setError(pollError instanceof Error ? pollError.message : "Could not read scan progress.");
          setIsScanning(false);
          setActiveScanSessionId(null);
          scanAbortRef.current = null;
        }
      };

      void poll();
    } catch (scanError) {
      if (!(scanError instanceof Error && scanError.name === "AbortError")) {
        setError(scanError instanceof Error ? scanError.message : "Could not start scan.");
      }
      setIsScanning(false);
      setActiveScanSessionId(null);
    }
  }

  async function cancelScan() {
    const endpoint = import.meta.env.VITE_SCAN_API_URL;
    const sessionId = activeScanSessionId;
    if (endpoint && sessionId) {
      try {
        await fetch(endpoint.replace(/\/$/, "") + "/api/scans/" + encodeURIComponent(sessionId), { method: "DELETE" });
      } catch {
        setError("The scan was stopped locally, but the server could not be notified.");
      }
    }
    scanAbortRef.current?.abort();
    scanAbortRef.current = null;
    if (scanTimerRef.current !== null) {
      window.clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    setIsScanning(false);
    setActiveScanSessionId(null);
    setScanStage("idle");
  }
  useEffect(() => () => {
    scanAbortRef.current?.abort();
    if (scanTimerRef.current !== null) window.clearTimeout(scanTimerRef.current);
  }, []);

  const primaryScan = scanResults[0]?.scan.ok ? scanResults[0].scan : null;
  const hasResults = findings.length > 0;
  const critical = severityCount(findings, "high");
  const medium = severityCount(findings, "medium");
  const low = severityCount(findings, "low");
  const issuesVisible = hasResults ? filteredFindings : sampleFindings;
  const currentSite = displayHostname(url);
  const issueLabel = findings.length === 1 ? "finding" : "findings";

  return (
    <div className="saas-app">
      <aside className="saas-sidebar">
        <div className="saas-sidebar-head">
          <a href="#app/overview" className="saas-brand">
            <ShellLogo />
            <span>Visibilio</span>
          </a>
          <div className="workspace-switcher site-switcher" aria-label="Current website">
            <span className="workspace-avatar site-avatar">{url ? displayHostname(url).charAt(0).toUpperCase() : "W"}</span>
            <div className="workspace-copy">
              <strong>{url ? displayHostname(url) : "Your website"}</strong>
              <small>{url ? "Active site" : "Add a site to begin"}</small>
            </div>
            <span className="workspace-chevron" aria-hidden="true">⌄</span>
          </div>
        </div>

        <div className="saas-sidebar-section">
          <span className="saas-sidebar-label">Website</span>
          <nav aria-label="Primary">
            {sections.map((item) => (
              <a
                key={item.id}
                href={"#app/" + item.id}
                className={"saas-nav-link" + (section === item.id ? " is-active" : "")}
                aria-current={section === item.id ? "page" : undefined}
              >
                <span>{item.label}</span>
                <small>{item.key}</small>
              </a>
            ))}
          </nav>
        </div>

        <div className="saas-sidebar-bottom">
          <a className="sidebar-meta-link" href="#app/analyze">+ New scan</a>
          <a className="sidebar-meta-link" href="#app/settings">Settings</a>
        </div>
      </aside>
      <div className="saas-main">
        <header className="saas-topbar">
          <div className="topbar-context">
            <span className="topbar-kicker">Website</span>
            <strong>{displayHostname(url)}</strong>
          </div>
          <div className="topbar-actions">
            <a className="topbar-back" href="#top">Back to site</a>
            <span className="connection-status"><i aria-hidden="true" /> Scanner ready</span>
            <button className="avatar-button" type="button" aria-label="Open account menu">U</button>
          </div>
        </header>
        <div className="saas-content">
          {section === "overview" && (
            <>
              <section className="workspace-welcome">
                <div className="workspace-welcome-copy">
                  <span className="eyebrow">Website overview</span>
                  <h1>{url ? "Let’s check this site." : "Start with a website."}</h1>
                  <p>
                    {url
                      ? "Your site is ready. Run a scan, inspect what was found, make the change, and re-test the same check."
                      : "Paste a public page to create your first audit. Findings and re-tests stay attached to the site you are working on."}
                  </p>
                  {url && <div className="workspace-url-chip"><span>PAGE</span><strong>{url}</strong></div>}
                  <div className="workspace-welcome-actions">
                    <a className="solid-button" href="#app/analyze">{url ? "Scan this page" : "Add a website"}</a>
                    {url && <a className="text-link" href="#app/history">See past scans →</a>}
                  </div>
                </div>
                <div className="workspace-flow-card">
                  <span className="surface-kicker">What happens next</span>
                  <div className="workspace-flow-step is-active"><b>01</b><strong>Scan</strong><small>Measure the page in controlled browsers.</small></div>
                  <div className="workspace-flow-step"><b>02</b><strong>Inspect</strong><small>Open the evidence behind each finding.</small></div>
                  <div className="workspace-flow-step"><b>03</b><strong>Re-test</strong><small>Verify a change with the same check.</small></div>
                </div>
              </section>
              {hasResults && (
                <section className="context-strip workspace-result-strip">
                  <div>
                    <span>Last scan</span>
                    <strong>{primaryScan ? "Just now" : "Not scanned yet"}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>{statusLabel(primaryScan)}</strong>
                  </div>
                  <div>
                    <span>Viewports</span>
                    <strong>390 × 844 · 1440 × 900</strong>
                  </div>
                  <div>
                    <span>Findings</span>
                    <strong>{findings.length}</strong>
                  </div>
                </section>
              )}

              <section className="workspace-grid">
                <div className="surface surface-main">
                  <div className="surface-heading">
                    <div>
                      <span className="surface-kicker">{hasResults ? "Latest scan" : "Get started"}</span>
                      <h2>{hasResults ? "Findings that need attention" : "Run your first audit"}</h2>
                    </div>
                    <a href="#app/analyze">New scan</a>
                  </div>
                  {hasResults ? (
                    <div className="compact-list">
                      {findings.slice(0, 5).map((finding) => (
                        <button
                          key={finding.id}
                          className="compact-list-row"
                          type="button"
                          onClick={() => {
                            setSelectedFindingId(finding.id);
                            window.location.hash = "#app/findings?finding=" + encodeURIComponent(finding.id);
                          }}
                        >
                          <span className={"severity-dot severity-" + finding.severity} />
                          <span className="compact-copy">
                            <strong>{finding.title}</strong>
                            <small>{finding.selector ?? finding.rule}</small>
                          </span>
                          <span className="row-meta">{finding.viewport.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-workspace">
                      <span className="empty-mark">01</span>
                      <strong>Analyze a live page</strong>
                      <p>
                        Run the scanner against a website and turn browser measurements into findings you can inspect.
                      </p>
                      <a className="text-link" href="#app/analyze">
                        Start a scan →
                      </a>
                    </div>
                  )}
                </div>

                <aside className="surface surface-side">
                  <span className="surface-kicker">Next steps</span>
                  <div className="workflow-steps">
                    <div className="workflow-step is-current">
                      <b>01</b>
                      <span>
                        <strong>Scan</strong>
                        <small>Measure the site</small>
                      </span>
                    </div>
                    <div className="workflow-step">
                      <b>02</b>
                      <span>
                        <strong>Inspect</strong>
                        <small>Open a finding</small>
                      </span>
                    </div>
                    <div className="workflow-step">
                      <b>03</b>
                      <span>
                        <strong>Fix</strong>
                        <small>Apply the next step</small>
                      </span>
                    </div>
                    <div className="workflow-step">
                      <b>04</b>
                      <span>
                        <strong>Re-test</strong>
                        <small>Measure again</small>
                      </span>
                    </div>
                  </div>
                </aside>
              </section>
            </>
          )}

          {section === "analyze" && (
            <section className="page-intro narrow-page">
              <span className="eyebrow">New audit</span>
              <h1>Scan a website.</h1>
              <p>
                Run a browser-backed audit across controlled viewports. Visibilio turns measurements into findings you can inspect and re-test.
              </p>
              <div className="scan-composer">
                <label htmlFor="scan-url">Website URL</label>
                <div className="scan-input-row">
                  <input
                    id="scan-url"
                    type="url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://yourwebsite.com"
                    spellCheck={false}
                  />
                  {isScanning ? (
                    <button
                      className="outline-button"
                      type="button"
                      onClick={cancelScan}
                    >
                      Cancel scan
                    </button>
                  ) : (
                    <button
                      className="solid-button"
                      type="button"
                      onClick={runScan}
                      disabled={!url}
                    >
                      Run scan
                    </button>
                  )}
                </div>
                <div className="scan-meta">
                  <span>HTTP / HTTPS only</span>
                  <span>2 controlled viewports</span>
                  <span>Evidence-first</span>
                </div>
                {error && <div className="inline-error">{error}</div>}
              </div>

              <div className="scan-stages" aria-live="polite">
                {[
                  ["01", "Page loaded"],
                  ["02", "Desktop viewport"],
                  ["03", "Mobile viewport"],
                  ["04", "Accessibility checks"],
                  ["05", "Layout checks"],
                ].map(([key, label]) => (
                  <div className="stage" key={key}>
                    <b>{key}</b>
                    <span>{label}</span>
                    <small>{isScanning ? (key === "01" ? "loading" : scanStage === "done" ? "complete" : "running") : "ready"}</small>
                  </div>
                ))}
              </div>
            </section>
          )}

          {section === "findings" && (
            <section>
              <div className="page-intro findings-intro">
                <div>
                  <span className="eyebrow">{currentSite}</span>
                  <h1>Findings.</h1>
                  <p>
                    Review measured issues on this site. Open one to see the evidence, context, and next action.
                  </p>
                </div>
                <div className="finding-count">
                  <strong>{hasResults ? findings.length : sampleFindings.length}</strong>
                  <span>{hasResults ? issueLabel : "sample findings"}</span>
                </div>
              </div>

              <div className="finder-toolbar">
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Filter findings…"
                  aria-label="Filter findings"
                />
                {(["all", "high", "medium", "low"] as const).map((value) => (
                  <button
                    key={value}
                    className={"filter-chip" + (severity === value ? " is-active" : "")}
                    type="button"
                    onClick={() => setSeverity(value)}
                  >
                    {value}
                  </button>
                ))}
                {(["all", "open", "resolved", "ignored"] as const).map((value) => (
                  <button
                    key={value}
                    className={"filter-chip" + (statusFilter === value ? " is-active" : "")}
                    type="button"
                    onClick={() => setStatusFilter(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>

              <div className="finding-layout">
                <div className="finding-list">
                  {issuesVisible.map((finding) => (
                    <button
                      key={finding.id}
                      type="button"
                      className={"finding-row" + (finding.id === selectedFinding.id ? " is-selected" : "")}
                      onClick={() => setSelectedFindingId(finding.id)}
                    >
                      <span className={"severity-pill severity-pill-" + finding.severity}>{finding.severity}</span>
                      <span className="finding-row-copy">
                        <strong>{finding.title}</strong>
                        <small>{finding.rule}</small>
                      </span>
                      <span className="finding-row-right">
                        <span>{finding.viewport.width} × {finding.viewport.height}</span>
                        <span>›</span>
                      </span>
                    </button>
                  ))}
                </div>

                <aside className="finding-detail surface">
                  <div className="detail-head">
                    <div>
                      <span className={"severity-pill severity-pill-" + selectedFinding.severity}>
                        {selectedFinding.severity}
                      </span>
                      <h2>{selectedFinding.title}</h2>
                      <p>{selectedFinding.description}</p>
                    </div>
                    <a
                      className="outline-button"
                      href={"#app/findings?finding=" + encodeURIComponent(selectedFinding.id)}
                      onClick={() => setFocusedFindingId(selectedFinding.id)}
                    >
                      Evidence
                    </a>
                  </div>
                  <div className="detail-section">
                    <span className="detail-label">Context</span>
                    <div className="detail-grid">
                      <div><small>Viewport</small><strong>{selectedFinding.viewport.name}</strong></div>
                      <div><small>Selector</small><strong>{selectedFinding.selector ?? "—"}</strong></div>
                      <div><small>Rule</small><strong>{selectedFinding.rule}</strong></div>
                      <div><small>Status</small><strong>{selectedFinding.status}</strong></div>
                    </div>
                  </div>
                  <div className="detail-section">
                    <span className="detail-label">Next action</span>
                    <div className="finding-status-actions">
                      <a
                        className="solid-button"
                        href={"#app/findings?finding=" + encodeURIComponent(selectedFinding.id)}
                      >
                        Review evidence
                      </a>
                      <button
                        className="outline-button"
                        type="button"
                        disabled={retestBusy}
                        onClick={() => {
                          setUrl(selectedFinding.url);
                          void runRetest();
                        }}
                      >
                        {retestBusy ? "Re-testing…" : "Re-test"}
                      </button>
                    </div>
                  </div>

                  <div className="detail-section">
                    <span className="detail-label">Status</span>
                    <div className="finding-status-actions">
                      {(["open", "resolved", "ignored"] as const).map((value) => (
                        <button
                          key={value}
                          className="outline-button"
                          type="button"
                          onClick={() => void updateFindingStatus(value)}
                          disabled={selectedFinding.status === value}
                        >
                          {value === "open" ? "Open" : value === "resolved" ? "Resolve" : "Ignore"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {retestComparison?.ok && retestComparison.comparison.findingId === selectedFinding.id && (
                    <div className="detail-section retest-inline-result">
                      <span className="detail-label">Latest re-test</span>
                      <strong>{retestComparison.comparison.outcome === "resolved" ? "Resolved in the re-test" : "Still present in the re-test"}</strong>
                      <small>
                        Same rule · {retestComparison.session.siteName} · {retestComparison.session.id}
                      </small>
                    </div>
                  )}

                  <div className="detail-section">
                    <span className="detail-label">Measurements</span>
                    <div className="measurement-line">
                      {selectedFinding.evidence?.map((item) => (
                        <span key={item.metric}>
                          <b>{item.value}{item.unit}</b>
                          {item.metric}
                        </span>
                      ))}
                    </div>
                  </div>
                </aside>
              </div>
            </section>
          )}

          {section === "history" && (
            <section>
              <div className="page-intro">
                <div>
                  <span className="eyebrow">{currentSite}</span>
                  <h1>Scan history.</h1>
                  <p>Use previous scans as the baseline for what changed, what remains, and what to re-test.</p>
                </div>
                <a className="solid-button" href="#app/analyze">New scan</a>
              </div>

              <div className="history-summary surface">
                <div><span>Scans</span><strong>{history?.ok ? history.sessions.length : 0}</strong><small>stored sessions</small></div>
                <div><span>Latest findings</span><strong>{history?.ok && history.sessions[0] ? history.sessions[0].findings.length : 0}</strong><small>on most recent scan</small></div>
                <div><span>Website</span><strong>{currentSite}</strong><small>active audit target</small></div>
              </div>

              <div className="history-table surface">
                <div className="history-header">
                  <span>Scan</span>
                  <span>Status</span>
                  <span>Findings</span>
                  <span>Timestamp</span>
                </div>
                {historyLoading && (
                  <div className="history-row">
                    <strong>Loading scan history…</strong>
                    <span>loading</span>
                    <span>—</span>
                    <span>Fetching previous scans</span>
                  </div>
                )}
                {!historyLoading && history?.ok && history.sessions.length > 0 &&
                  history.sessions.map((session) => (
                    <button
                      key={session.id}
                      className="history-row history-row-button"
                      type="button"
                      onClick={() => {
                        setResponse({
                          ok: true,
                          session,
                          url: session.url,
                          results: session.results.map((scan) => ({
                            viewport: scan.viewport,
                            scan,
                          })),
                        });
                        setSelectedFindingId(session.findings[0]?.id ?? null);
                        window.location.hash = "#app/findings" + (session.findings[0] ? "?finding=" + encodeURIComponent(session.findings[0].id) : "");
                      }}
                    >
                      <strong>{session.id}</strong>
                      <span>{session.status}</span>
                      <span>{session.findings.length}</span>
                      <span>{new Date(session.createdAt).toLocaleString()}</span>
                    </button>
                  ))}
                {!historyLoading && (!history?.ok || history.sessions.length === 0) && (
                  <div className="history-row">
                    <strong>No stored scan sessions</strong>
                    <span>—</span>
                    <span>—</span>
                    <span>Run a scan to create history</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {section === "settings" && (
            <section className="settings-layout">
              <div className="page-intro">
                <span className="eyebrow">Settings</span>
                <h1>Site settings.</h1>
                <p>Scan defaults and account configuration for the website you are working on.</p>
              </div>

              <div className="settings-list surface">
                <div><span>Website</span><strong>{url ? displayHostname(url) : "No website selected"}</strong><small>Current audit target</small></div>
                <div><span>Scan API</span><strong>{import.meta.env.VITE_SCAN_API_URL || "Not configured"}</strong><small>Environment configuration</small></div>
                <div><span>Default viewports</span><strong>390 × 844 and 1440 × 900</strong><small>Controlled scanner presets</small></div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default AppShell;
