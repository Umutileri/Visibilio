import type {
  IssueSeverity,
  UIssue,
  ScanResult,
} from "./scanner/types";
import type { ScanApiResponse, ScanRetestResponse, ScanSessionGetResponse, ScanSessionListResponse, ScanSessionStartResponse, WebsiteListResponse } from "./api/types";
import type { WebsiteRef } from "./api/sessionTypes";
import { compareScanSessions } from "./api/scanComparison";
import { useEffect, useMemo, useRef, useState } from "react";

type AppSection =
  | "overview"
  | "analyze"
  | "findings"
  | "history"
  | "settings";

type RetestUiComparison = {
  session: { id: string; siteName: string };
  comparison: {
    findingId: string;
    outcome: "resolved" | "still-present" | "inconclusive";
  };
};

const sections: Array<{ id: AppSection; label: string; key: string }> = [
  { id: "overview", label: "Overview", key: "01" },
  { id: "analyze", label: "Analyze", key: "02" },
  { id: "findings", label: "Findings", key: "03" },
  { id: "history", label: "History", key: "04" },
  { id: "settings", label: "Settings", key: "05" },
];

function sectionFromHash(): AppSection {
  const value = window.location.hash.replace("#app/", "").split("?")[0];
  if (value === "evidence") return "findings";
  return sections.some((section) => section.id === value)
    ? (value as AppSection)
    : "overview";
}

function displayHostname(value: string): string {
  if (!value) return "Choose a website";
  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
}

function websiteKey(value: string): string {
  if (!value) return "";
  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\\./, "");
    const port = parsed.port || (parsed.protocol === "https:" ? "443" : "80");
    return hostname + ":" + port;
  } catch {
    return "";
  }
}

function flattenResults(
  results: Array<{ viewport: { name: string }; scan: ScanResult }>,
): UIssue[] {
  return results.flatMap(({ scan }) => (scan.ok ? scan.issues : []));
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
  const [siteMenuOpen, setSiteMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [activeScanSessionId, setActiveScanSessionId] = useState<string | null>(null);
  const [scanStage, setScanStage] = useState<"idle" | "loading" | "desktop" | "mobile" | "done">("idle");
  const scanAbortRef = useRef<AbortController | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const retestTimerRef = useRef<number | null>(null);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<ScanApiResponse | null>(null);
  const [history, setHistory] = useState<ScanSessionListResponse | null>(null);
  const [websites, setWebsites] = useState<WebsiteRef[]>([]);
  const [websitesLoading, setWebsitesLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<"all" | IssueSeverity>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | UIssue["status"]>("all");
  const [retestBusy, setRetestBusy] = useState(false);
  const [retestComparison, setRetestComparison] = useState<RetestUiComparison | null>(null);
  const [evidenceOpen, setEvidenceOpen] = useState(false);

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

    const loadWebsites = async () => {
      setWebsitesLoading(true);
      try {
        const result = await fetch(endpoint.replace(/\/$/, "") + "/api/websites");
        const data = (await result.json()) as WebsiteListResponse;
        if (!cancelled && data.ok) setWebsites(data.websites);
      } catch {
        if (!cancelled) setWebsites([]);
      } finally {
        if (!cancelled) setWebsitesLoading(false);
      }
    };

    void loadWebsites();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const endpoint = import.meta.env.VITE_SCAN_API_URL;
    if (!endpoint) return;

    let cancelled = false;

    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const site = websiteKey(url);
        const historyUrl =
          endpoint.replace(/\/$/, "") +
          "/api/scans" +
          (site ? "?site=" + encodeURIComponent(site) : "");
        const result = await fetch(historyUrl);
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
  }, [url]);
  const findings = useMemo(() => flattenResults(scanResults), [scanResults]);

  const latestHistorySession = history?.ok ? history.sessions[0] : undefined;
  const previousHistorySession =
    history?.ok && history.sessions.length > 1 ? history.sessions[1] : undefined;
  const historyComparison = useMemo(
    () =>
      latestHistorySession
        ? compareScanSessions(latestHistorySession, previousHistorySession)
        : null,
    [latestHistorySession, previousHistorySession],
  );

  useEffect(() => {
    if (!focusedFindingId) return;
    if (findings.some((finding) => finding.id === focusedFindingId)) {
      setSelectedFindingId(focusedFindingId);
    }
  }, [focusedFindingId, findings]);
  const selectedFinding =
    findings.find((finding) => finding.id === selectedFindingId) ??
    findings[0] ??
    null;

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
          retestTimerRef.current = window.setTimeout(
            () =>
              void poll().catch((error) =>
                setError(
                  error instanceof Error
                    ? error.message
                    : "Could not read re-test progress.",
                ),
              ),
            700,
          );
          return;
        }

        if (pollData.session.status === "failed" || pollData.session.status === "cancelled") {
          throw new Error(
            pollData.session.status === "cancelled"
              ? "Re-test was cancelled."
              : "Re-test failed.",
          );
        }

        const comparison = pollData.session.findings.find(
          (finding) =>
            finding.rule === selectedFinding.rule &&
            finding.viewport.width === selectedFinding.viewport.width &&
            finding.viewport.height === selectedFinding.viewport.height &&
            finding.selector === selectedFinding.selector,
        );
        const sameViewportScan = pollData.session.results.some(
          (result) =>
            result.ok &&
            result.viewport.width === selectedFinding.viewport.width &&
            result.viewport.height === selectedFinding.viewport.height,
        );
        setRetestComparison({
          session: pollData.session,
          comparison: {
            findingId: selectedFinding.id,
            outcome: comparison
              ? "still-present"
              : sameViewportScan
                ? "inconclusive"
                : "inconclusive",
          },
        });
        setResponse({
          ok: true,
          session: pollData.session,
          url: pollData.session.url,
          results: pollData.session.results.map((scan) => ({ viewport: scan.viewport, scan })),
        });
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
    if (retestTimerRef.current !== null) {
      window.clearTimeout(retestTimerRef.current);
      retestTimerRef.current = null;
    }
    setIsScanning(false);
    setActiveScanSessionId(null);
    setScanStage("idle");
  }
  useEffect(() => () => {
    scanAbortRef.current?.abort();
    if (scanTimerRef.current !== null) window.clearTimeout(scanTimerRef.current);
    if (retestTimerRef.current !== null) window.clearTimeout(retestTimerRef.current);
  }, []);

  const primaryScan = scanResults[0]?.scan.ok ? scanResults[0].scan : null;
  const hasResults = findings.length > 0;
  const issuesVisible = filteredFindings;
  const currentSite = displayHostname(url);
  const issueLabel = findings.length === 1 ? "finding" : "findings";
  const selectedArtifact = response?.ok && selectedFinding
    ? response.session.artifacts.find(
        (artifact) =>
          artifact.viewport.width === selectedFinding.viewport.width &&
          artifact.viewport.height === selectedFinding.viewport.height,
      )
    : null;
  const scanApiBase = import.meta.env.VITE_SCAN_API_URL?.replace(/\/$/, "") ?? "";


  useEffect(() => {
    if (!evidenceOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEvidenceOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [evidenceOpen]);

  return (
    <div className="saas-app">
      <aside className="saas-sidebar">
        <div className="saas-sidebar-head">
          <a href="#app/overview" className="saas-brand">
            <ShellLogo />
            <span>Visibilio</span>
          </a>
          <div className={"site-switcher-shell site-switcher" + (siteMenuOpen ? " is-open" : "")}>
            <button
              className="site-switcher-button"
              type="button"
              aria-expanded={siteMenuOpen}
              aria-haspopup="true"
              onClick={() => setSiteMenuOpen((value) => !value)}
            >
              <span className="site-avatar-shell site-avatar">{url ? displayHostname(url).charAt(0).toUpperCase() : "W"}</span>
              <span className="site-copy">
                <strong>{url ? displayHostname(url) : "Your website"}</strong>
                <small>{url ? "Active site" : "Add a site to begin"}</small>
              </span>
              <span className="site-chevron" aria-hidden="true">⌄</span>
            </button>
            {siteMenuOpen && (
              <div className="site-switcher-menu">
                <span className="site-switcher-label">Websites</span>
                {websitesLoading && <span className="site-switcher-empty">Loading sites…</span>}
                {!websitesLoading && websites.map((site) => (
                  <button
                    key={site.key}
                    type="button"
                    className={websiteKey(url) === site.key ? "is-current" : undefined}
                    onClick={() => {
                      setUrl(site.url);
                      setResponse(null);
                      setSelectedFindingId(null);
                      setRetestComparison(null);
                      setSiteMenuOpen(false);
                      window.location.hash = "#app/overview";
                    }}
                  >
                    <strong>{site.name}</strong>
                    <small>{websiteKey(url) === site.key ? "Current website" : site.url}</small>
                  </button>
                ))}
                {!websitesLoading && websites.length === 0 && <span className="site-switcher-empty">No scanned websites yet.</span>}
                <a href="#app/analyze" onClick={() => setSiteMenuOpen(false)}>+ Add another website</a>
              </div>
            )}
          </div>
        </div>

        <div className="saas-sidebar-section">
          <span className="saas-sidebar-label">Website</span>
          <button
            className="mobile-nav-toggle"
            type="button"
            aria-expanded={mobileNavOpen}
            aria-controls="primary-navigation"
            onClick={() => setMobileNavOpen((value) => !value)}
          >
            <span aria-hidden="true">{mobileNavOpen ? "×" : "☰"}</span>
            <span>{mobileNavOpen ? "Close menu" : "Menu"}</span>
          </button>
          <nav
            id="primary-navigation"
            aria-label="Primary"
            className={mobileNavOpen ? "is-mobile-open" : ""}
          >
            {sections.map((item) => (
              <a
                key={item.id}
                href={"#app/" + item.id}
                className={"saas-nav-link" + (section === item.id ? " is-active" : "")}
                aria-current={section === item.id ? "page" : undefined}
                onClick={() => setMobileNavOpen(false)}
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
              <section className="site-welcome">
                <div className="site-welcome-copy">
                  <span className="eyebrow">Website overview</span>
                  <h1>{url ? "Let’s check this site." : "Start with a website."}</h1>
                  <p>
                    {url
                      ? "Your site is ready. Run a scan, inspect what was found, make the change, and re-test the same check."
                      : "Paste a public page to create your first audit. Findings and re-tests stay attached to the site you are working on."}
                  </p>
                  {url && <div className="site-url-chip"><span>PAGE</span><strong>{url}</strong></div>}
                  <div className="site-welcome-actions">
                    <a className="solid-button" href="#app/analyze">{url ? "Scan this page" : "Add a website"}</a>
                    {url && <a className="text-link" href="#app/history">See past scans →</a>}
                  </div>
                </div>
                <div className="site-flow-card">
                  <span className="surface-kicker">What happens next</span>
                  <div className="site-flow-step is-active"><b>01</b><strong>Scan</strong><small>Measure the page in controlled browsers.</small></div>
                  <div className="site-flow-step"><b>02</b><strong>Inspect</strong><small>Open the evidence behind each finding.</small></div>
                  <div className="site-flow-step"><b>03</b><strong>Re-test</strong><small>Verify a change with the same check.</small></div>
                </div>
              </section>
              {hasResults && (
                <>
                  <section className="context-strip site-result-strip">
                    <div>
                      <span>Latest scan</span>
                      <strong>{primaryScan ? "Completed" : "No result"}</strong>
                    </div>
                    <div>
                      <span>Issues found</span>
                      <strong>{findings.length}</strong>
                    </div>
                    <div>
                      <span>Open</span>
                      <strong>{findings.filter((finding) => finding.status === "open").length}</strong>
                    </div>
                    <div>
                      <span>Resolved</span>
                      <strong>{findings.filter((finding) => finding.status === "resolved").length}</strong>
                    </div>
                  </section>
                  <section className="audit-summary surface">
                    <div className="audit-summary-main">
                      <span className="surface-kicker">Audit summary</span>
                      <h2>
                        {findings.length === 0
                          ? "No issues were detected."
                          : findings.length === 1
                            ? "One issue needs your attention."
                            : `${findings.length} issues need your attention.`}
                      </h2>
                      <p>
                        {findings.length === 0
                          ? "The tested page passed the current deterministic checks. Re-test after meaningful UI changes."
                          : "Start with the highest-severity finding, inspect its evidence, make the change, then run the same check again."}
                      </p>
                      <div className="audit-summary-actions">
                        <a className="solid-button" href="#app/findings">
                          Review findings →
                        </a>
                        <a className="text-link" href="#app/history">
                          Compare past scans
                        </a>
                      </div>
                    </div>
                    <div className="audit-severity-grid" aria-label="Finding severity breakdown">
                      {(["high", "medium", "low"] as const).map((level) => (
                        <div key={level}>
                          <span>{level}</span>
                          <strong>{findings.filter((finding) => finding.severity === level).length}</strong>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}
              <section className="site-grid">
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
                    <div className="empty-site">
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
                ].map(([key, label]) => {
                  const stageKey = Number(key);
                  const currentStage =
                    scanStage === "loading" ? 1 :
                    scanStage === "desktop" ? 2 :
                    scanStage === "mobile" ? 3 :
                    scanStage === "done" ? 5 : 0;
                  const isComplete = !isScanning && scanStage === "done"
                    ? true
                    : stageKey < currentStage;
                  const isCurrent = stageKey === currentStage;
                  return (
                    <div className={"stage" + (isCurrent ? " is-current" : "") + (isComplete ? " is-complete" : "")} key={key}>
                      <b>{key}</b>
                      <span>{label}</span>
                      <small>{isComplete ? "complete" : isCurrent ? "running" : "ready"}</small>
                    </div>
                  );
                })}
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
                  <strong>{findings.length}</strong>
                  <span>{issueLabel}</span>
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
                      className={"finding-row" + (finding.id === selectedFinding?.id ? " is-selected" : "")}
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

                {selectedFinding ? (
                  <aside className="finding-detail surface">
                    <div className="detail-head">
                      <div>
                        <span className={"severity-pill severity-pill-" + selectedFinding.severity}>
                          {selectedFinding.severity}
                        </span>
                        <h2>{selectedFinding.title}</h2>
                        <p>{selectedFinding.description}</p>
                      </div>
                      <button
                        className="outline-button"
                        type="button"
                        onClick={() => {
                          setFocusedFindingId(selectedFinding.id);
                          setEvidenceOpen(true);
                        }}
                      >
                        Evidence
                      </button>
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
                        <button
                          className="solid-button"
                          type="button"
                          onClick={() => setEvidenceOpen(true)}
                          disabled={!selectedArtifact}
                        >
                          {selectedArtifact ? "Review evidence" : "Evidence unavailable"}
                        </button>
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
                    {retestComparison?.comparison.findingId === selectedFinding.id && (
                      <div className="detail-section retest-inline-result">
                        <span className="detail-label">Latest re-test</span>
                        <strong>{retestComparison.comparison.outcome === "resolved" ? "Resolved in the re-test" : retestComparison.comparison.outcome === "still-present" ? "Still present in the re-test" : "Could not confirm resolution"}</strong>
                        <small>
                          {retestComparison.comparison.outcome === "inconclusive" ? "The tested viewport completed, but the original finding could not be matched after the page structure changed." : "Same rule · " + retestComparison.session.siteName + " · " + retestComparison.session.id}
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
                ) : (
                  <aside className="finding-detail surface empty-site">
                    <span className="empty-mark">—</span>
                    <strong>{hasResults ? "No findings match these filters" : "No findings yet"}</strong>
                    <p>{hasResults ? "Try clearing a filter or search term to see the full audit." : "Run a website scan to generate measurable findings and evidence."}</p>
                    <a className="text-link" href="#app/analyze">Run a scan →</a>
                  </aside>
                )}
              </div>

              {evidenceOpen && response?.ok && selectedFinding && selectedArtifact && scanApiBase && (
                <div className="evidence-overlay" role="dialog" aria-modal="true" aria-label="Evidence viewer" onClick={() => setEvidenceOpen(false)}>
                  <div className="evidence-modal surface" onClick={(event) => event.stopPropagation()}>
                    <div className="evidence-modal-head">
                      <div>
                        <span className="detail-label">Visual evidence</span>
                        <strong>{selectedFinding.title}</strong>
                        <small>{selectedFinding.viewport.width} × {selectedFinding.viewport.height}</small>
                      </div>
                      <button className="outline-button" type="button" onClick={() => setEvidenceOpen(false)}>
                        Close
                      </button>
                    </div>
                    <div className="evidence-frame">
                      <img
                        src={
                          scanApiBase +
                          "/api/scans/" +
                          encodeURIComponent(response.session.id) +
                          "/artifacts/" +
                          encodeURIComponent(selectedArtifact.id)
                        }
                        alt={"Screenshot evidence for " + selectedFinding.title}
                      />
                    </div>
                  </div>
                </div>
              )}
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
                <div>
                  <span>Change</span>
                  <strong>
                    {historyComparison
                      ? historyComparison.newFindings.length + historyComparison.resolvedFindings.length
                      : "—"}
                  </strong>
                  <small>
                    {historyComparison?.previousSessionId ? "new + resolved since last scan" : "baseline scan"}
                  </small>
                </div>
              </div>

              {historyComparison && historyComparison.previousSessionId && (
                <div className="history-change-grid">
                  <div className="surface">
                    <span className="surface-kicker">New</span>
                    <strong>{historyComparison.newFindings.length}</strong>
                    <small>finding(s) not present in the previous scan.</small>
                  </div>
                  <div className="surface">
                    <span className="surface-kicker">Resolved</span>
                    <strong>{historyComparison.resolvedFindings.length}</strong>
                    <small>finding(s) no longer present in the latest scan.</small>
                  </div>
                  <div className="surface">
                    <span className="surface-kicker">Unchanged</span>
                    <strong>{historyComparison.unchangedFindings.length}</strong>
                    <small>finding(s) still present from the previous scan.</small>
                  </div>
                </div>
              )}

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
