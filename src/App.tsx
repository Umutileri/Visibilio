
import type { IssueSeverity, UIssue } from "./scanner/types";
import type { ScanApiResponse } from "./api/types";
import type { ScanResult } from "./scanner/types";
import { useEffect, useMemo, useState } from "react";
import "./index.css";

type AppSection = "overview" | "analyze" | "findings" | "evidence" | "history" | "settings";

const appSections: Array<{ id: AppSection; label: string; description: string }> = [
  { id: "overview", label: "Overview", description: "Audit workspace" },
  { id: "analyze", label: "Analyze", description: "Start a new audit" },
  { id: "findings", label: "Findings", description: "Review detected issues" },
  { id: "evidence", label: "Evidence", description: "Inspect measurements" },
  { id: "history", label: "History", description: "Past scans" },
  { id: "settings", label: "Settings", description: "Workspace preferences" },
];

type FlatFinding = UIssue & { viewportLabel: string };
type ScanHistoryItem = { id: string; url: string; scannedAt: string; issueCount: number; high: number; medium: number; low: number };

function apiBaseUrl(): string {
  return (import.meta.env.VITE_SCAN_API_URL ?? "").replace(/\/$/, "");
}

function flattenResults(results: Array<{ viewport: { name: string }; scan: ScanResult }>): FlatFinding[] {
  return results.flatMap((entry) => (entry.scan.ok ? entry.scan.issues.map((issue) => ({ ...issue, viewportLabel: entry.viewport.name })) : []));
}

function severityCount(findings: UIssue[], severity: IssueSeverity): number {
  return findings.filter((finding) => finding.severity === severity).length;
}

async function runScan(url: string): Promise<ScanApiResponse> {
  const base = apiBaseUrl();
  if (!base) throw new Error("Scan API is not configured. Set VITE_SCAN_API_URL for the connected scanner.");
  const response = await fetch(base + "/api/scan", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const data = (await response.json()) as ScanApiResponse;
  if (!response.ok || !data.ok) {
    throw new Error(data.ok ? "Scan failed." : data.error.message);
  }
  return data;
}

function getAppSection(): AppSection | null {
  const match = window.location.hash.match(/^#app\/(.+)$/);
  const section = match?.[1] as AppSection | undefined;
  return section && appSections.some((item) => item.id === section) ? section : null;
}

function AppShell() {
  const [section, setSection] = useState<AppSection>(getAppSection() ?? "overview");
  const [scan, setScan] = useState<ScanApiResponse | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const onHashChange = () => setSection(getAppSection() ?? "overview");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const findings = useMemo(() => (scan?.ok ? flattenResults(scan.results) : []), [scan]);
  const selectedFinding = findings.find((finding) => finding.id === selectedId) ?? findings[0] ?? null;

  function handleScanComplete(result: ScanApiResponse) {
    setScan(result);
    if (result.ok) {
      const next = flattenResults(result.results)[0];
      setSelectedId(next?.id ?? null);
      window.location.hash = "app/findings";
    }
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar-top">
          <a className="shell-brand" href="#app/overview" aria-label="Visibilio overview">
            <img className="shell-brand-logo" src="/Visibilio/visibilio-icon.svg" alt="" aria-hidden="true" />
            <span>Visibilio</span>
          </a>
          <div className="workspace-switcher">
            <span className="workspace-mark" aria-hidden="true">V</span>
            <div><strong>My workspace</strong><span>Personal</span></div>
          </div>
        </div>

        <nav className="app-nav" aria-label="Product navigation">
          <span className="app-nav-label">Workspace</span>
          {appSections.map((item) => (
            <a className={"app-nav-item " + (item.id === section ? "is-active" : "")} href={"#app/" + item.id} key={item.id} aria-current={item.id === section ? "page" : undefined}>
              <span className="app-nav-glyph" aria-hidden="true">{item.label.charAt(0)}</span>
              <span><strong>{item.label}</strong><small>{item.description}</small></span>
            </a>
          ))}
        </nav>

        <div className="app-sidebar-footer">
          <a href="#principles">View product principles</a>
          <span className="shell-status"><i aria-hidden="true" /> Evidence-first product</span>
        </div>
      </aside>

      <main className="app-main">
        <header className="app-header">
          <div className="app-breadcrumbs"><span>Workspace</span><span aria-hidden="true">/</span><strong>{appSections.find((item) => item.id === section)?.label}</strong></div>
          <div className="app-header-actions">
            <a className="shell-header-home" href="#top">Exit workspace</a>
            <a className="shell-header-action" href="#app/analyze">New analysis</a>
          </div>
        </header>

        <div className="app-content">
          {section === "analyze" && <AnalyzeEntry onComplete={handleScanComplete} />}
          {section === "findings" && <FindingsWorkspace findings={findings} selected={selectedFinding} onSelect={setSelectedId} hasScan={Boolean(scan)} />}
          {section === "evidence" && <EvidenceWorkspace finding={selectedFinding} hasScan={Boolean(scan)} />}
          {section === "overview" && <OverviewWorkspace findings={findings} scan={scan} />}
          {section === "history" && <HistoryWorkspace findings={findings} scan={scan} />}
          {section === "settings" && <SettingsWorkspace />}
        </div>
      </main>

      <nav className="app-mobile-nav" aria-label="Mobile product navigation">
        {appSections.map((item) => (
          <a className={item.id === section ? "is-active" : ""} href={"#app/" + item.id} key={item.id} aria-current={item.id === section ? "page" : undefined}>
            <span aria-hidden="true">{item.label.charAt(0)}</span><small>{item.label}</small>
          </a>
        ))}
      </nav>
    </div>
  );
}

function AnalyzeEntry({ onComplete }: { onComplete: (result: ScanApiResponse) => void }) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "scanning" | "error" | "success">("idle");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!url.trim() || status === "scanning") return;
    setStatus("scanning");
    setError("");
    try {
      const target = new URL(url.trim());
      if (target.protocol !== "http:" && target.protocol !== "https:") throw new Error("Use an HTTP or HTTPS URL.");
      const result = await runScan(url.trim());
      onComplete(result);
      setStatus("success");
    } catch (scanError) {
      setStatus("error");
      setError(scanError instanceof Error ? scanError.message : "The scan could not be completed.");
    }
  }

  return (
    <section className="app-page">
      <div className="app-content-heading">
        <div><span className="eyebrow">New audit</span><h1>Start with the page you want to understand.</h1><p>Visibilio checks configured viewports and turns reproducible measurements into findings.</p></div>
        <span className="app-build-label">LIVE SCAN PATH</span>
      </div>

      <div className="analyze-entry">
        <div className="analyze-entry-copy">
          <span className="shell-step">01 / TARGET</span>
          <h2>One URL in. Evidence-backed findings out.</h2>
          <p>Security validation stays on the server. The UI only submits the target and renders the structured result returned by the scan boundary.</p>
          <div className="scan-stages">
            <div className="scan-stage is-done"><span>01</span><div><strong>Validate target</strong><small>Accept the target only through the scan boundary.</small></div></div>
            <div className={"scan-stage " + (status === "scanning" ? "is-current" : "")}><span>02</span><div><strong>Scan viewports</strong><small>Run the configured mobile and desktop presets.</small></div></div>
            <div className={"scan-stage " + (status === "success" ? "is-done" : "")}><span>03</span><div><strong>Prepare findings</strong><small>Group issues, measurements, and selectors.</small></div></div>
          </div>
        </div>

        <div className="shell-url-panel">
          <form className="shell-url-form" onSubmit={submit}>
            <label htmlFor="workspace-url">Website URL</label>
            <div className="shell-url-row">
              <input id="workspace-url" type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com" required disabled={status === "scanning"} />
              <button type="submit" disabled={!url.trim() || status === "scanning"}>{status === "scanning" ? "Scanning…" : "Start analysis"}</button>
            </div>
            <span className="shell-form-note">The browser scan runs on the configured server, not in the public UI.</span>
          </form>
          {status === "scanning" && <div className="scan-inline-state" aria-live="polite"><span className="scan-spinner" /> Running mobile + desktop checks…</div>}
          {status === "error" && <div className="scan-inline-state is-error" aria-live="assertive"><strong>Scan could not complete.</strong><span>{error}</span></div>}
          {status === "success" && <div className="scan-inline-state is-success" aria-live="polite"><strong>Scan complete.</strong><span>Findings are ready in the workspace.</span></div>}
        </div>
      </div>
    </section>
  );
}

function FindingsWorkspace({ findings, selected, onSelect, hasScan }: { findings: FlatFinding[]; selected: FlatFinding | null; onSelect: (id: string) => void; hasScan: boolean }) {
  const [severity, setSeverity] = useState<"all" | IssueSeverity>("all");
  const [category, setCategory] = useState<"all" | UIssue["category"]>("all");

  const visible = findings.filter((finding) => (severity === "all" || finding.severity === severity) && (category === "all" || finding.category === category));

  return (
    <section className="app-page">
      <div className="app-content-heading">
        <div><span className="eyebrow">Findings</span><h1>{hasScan ? "Review what the scan actually found." : "Your findings appear after a scan."}</h1><p>{hasScan ? "Start with severity and move into the measured evidence behind each issue." : "Run an analysis to populate this workspace with real scanner output."}</p></div>
        <span className="app-build-label">{hasScan ? findings.length + " FINDINGS" : "EMPTY STATE"}</span>
      </div>

      {!hasScan ? <WorkspaceEmpty title="No scan yet." text="Run a website analysis and this view will become the evidence-first issue workspace." action="#app/analyze" actionLabel="Start analysis" /> : (
        <>
          <div className="finding-severity-strip">
            {(["all", "high", "medium", "low"] as const).map((item) => <button type="button" className={severity === item ? "is-active" : ""} key={item} onClick={() => setSeverity(item)}>{item === "all" ? "All" : item} <strong>{item === "all" ? findings.length : severityCount(findings, item)}</strong></button>)}
          </div>
          <div className="findings-toolbar">
            <label><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value as typeof category)}><option value="all">All categories</option><option value="responsive">Responsive</option><option value="accessibility">Accessibility</option><option value="layout">Layout</option></select></label>
            <span className="findings-toolbar-note">Live result · evidence stays attached</span>
          </div>

          <div className="findings-grid">
            <div className="finding-list" aria-label="Detected findings">
              {visible.length ? visible.map((finding) => <button type="button" className={"finding-row " + (selected?.id === finding.id ? "is-selected" : "")} key={finding.id} onClick={() => onSelect(finding.id)}>
                <span className={"severity-dot severity-dot-" + finding.severity} aria-hidden="true" />
                <span className="finding-row-copy"><strong>{finding.title}</strong><small>{finding.category} · {finding.viewportLabel}</small></span>
                <span className="finding-chevron" aria-hidden="true">→</span>
              </button>) : <div className="finding-list-empty"><strong>No findings match these filters.</strong><span>Try another category or severity.</span></div>}
            </div>

            <aside className="finding-detail" aria-live="polite">
              {selected ? <>
                <div className="finding-detail-top"><span className={"severity-badge severity-badge-" + selected.severity}>{selected.severity}</span><span>{selected.category}</span></div>
                <h3>{selected.title}</h3><p>{selected.description}</p>
                <div className="finding-evidence-box"><span>Measured evidence</span><strong>{selected.evidence?.[0]?.value ?? "—"}{selected.evidence?.[0]?.unit ?? ""} {selected.evidence?.[0]?.metric === "horizontalOverflow" ? "horizontal overflow" : selected.evidence?.[0]?.metric ?? "rule evidence"}</strong></div>
                <div className="finding-detail-meta"><span>Viewport</span><strong>{selected.viewport.width} × {selected.viewport.height}</strong></div>
                <div className="finding-detail-meta"><span>Selector</span><strong>{selected.selector ?? "Not available"}</strong></div>
                <div className="finding-detail-meta"><span>Status</span><strong>{selected.status}</strong></div>
                <a className="shell-inline-action" href="#app/evidence">Open evidence →</a>
              </> : <div className="finding-detail-empty">Select a finding to inspect its details.</div>}
            </aside>
          </div>
        </>
      )}
    </section>
  );
}

function EvidenceWorkspace({ finding, hasScan }: { finding: FlatFinding | null; hasScan: boolean }) {
  return (
    <section className="app-page">
      <div className="app-content-heading">
        <div><span className="eyebrow">Evidence</span><h1>{finding ? "See the measurement, selector, and viewport together." : "Evidence stays attached to findings."}</h1><p>Interpretation can change. The underlying measurement should remain inspectable.</p></div>
        <span className="app-build-label">{hasScan ? "INSPECT MODE" : "NO RESULT"}</span>
      </div>
      {!finding ? <WorkspaceEmpty title="No finding selected." text="Run a scan and choose an issue from Findings to inspect its supporting evidence." action="#app/findings" actionLabel="Open findings" /> : (
        <div className="evidence-detail-workspace">
          <div className="evidence-detail-main">
            <div className="evidence-detail-header"><div><span className={"severity-badge severity-badge-" + finding.severity}>{finding.severity}</span><span className="evidence-rule">{finding.rule}</span></div><span>{finding.viewport.name} · {finding.viewport.width} × {finding.viewport.height}</span></div>
            <h2>{finding.title}</h2><p>{finding.description}</p>
            <div className="evidence-metrics">
              <div><span>Rule</span><strong>{finding.rule}</strong></div>
              <div><span>Selector</span><strong>{finding.selector ?? "Not available"}</strong></div>
              <div><span>Detected</span><strong>{new Date(finding.detectedAt).toLocaleString()}</strong></div>
            </div>
            <div className="evidence-measurements"><div className="evidence-section-label">Measurements</div>{Object.entries(finding.measurements ?? {}).length ? Object.entries(finding.measurements ?? {}).map(([key, value]) => <div className="evidence-measurement" key={key}><span>{key}</span><strong>{value}px</strong></div>) : <div className="finding-detail-empty">This rule did not expose numeric measurements.</div>}</div>
            <div className="evidence-next-step"><span className="eyebrow">Next</span><h3>Use this as the source of truth for the explanation layer.</h3><p>AI and suggested fixes should build on these facts instead of replacing them.</p></div>
          </div>
          <aside className="evidence-sidebar"><div className="evidence-preview-placeholder"><span>VISUAL EVIDENCE</span><strong>Screenshot storage is the next backend handoff.</strong><small>The scanner already captures PNG evidence. The UI will switch to a stable artifact URL instead of a server filesystem path.</small></div></aside>
        </div>
      )}
    </section>
  );
}

function OverviewWorkspace({ findings, scan }: { findings: FlatFinding[]; scan: ScanApiResponse | null }) {
  const high = severityCount(findings, "high"); const medium = severityCount(findings, "medium"); const low = severityCount(findings, "low");
  return <section className="app-page">
    <div className="app-content-heading"><div><span className="eyebrow">Overview</span><h1>{scan?.ok ? "Your latest audit is ready to inspect." : "A quiet workspace until there is evidence."}</h1><p>{scan?.ok ? scan.url : "Visibilio keeps the workspace empty rather than inventing scan activity."}</p></div><a className="shell-header-action" href="#app/analyze">New analysis</a></div>
    {scan?.ok ? <><div className="overview-stat-grid"><div><span>Total findings</span><strong>{findings.length}</strong></div><div><span>High</span><strong>{high}</strong></div><div><span>Medium</span><strong>{medium}</strong></div><div><span>Low</span><strong>{low}</strong></div></div><div className="overview-next"><div><span className="eyebrow">Recommended path</span><h2>Open the highest-severity finding, inspect evidence, then move toward a suggested fix.</h2></div><a className="shell-inline-action" href="#app/findings">Review findings →</a></div></> : <WorkspaceEmpty title="No analysis yet." text="The overview becomes meaningful after the first completed scan." action="#app/analyze" actionLabel="Start analysis" />}
  </section>;
}

function HistoryWorkspace({ findings, scan }: { findings: FlatFinding[]; scan: ScanApiResponse | null }) {
  const item: ScanHistoryItem | null = scan?.ok ? { id: scan.url + scan.results.length, url: scan.url, scannedAt: new Date().toISOString(), issueCount: findings.length, high: severityCount(findings, "high"), medium: severityCount(findings, "medium"), low: severityCount(findings, "low") } : null;
  return <section className="app-page"><div className="app-content-heading"><div><span className="eyebrow">History</span><h1>Past scans will become your comparison layer.</h1><p>For now, the workspace keeps the latest in-memory result visible without pretending persistence already exists.</p></div><span className="app-build-label">MVP</span></div>{item ? <div className="history-row"><div><strong>{item.url}</strong><span>{new Date(item.scannedAt).toLocaleString()}</span></div><div><span>{item.issueCount} findings</span><span>{item.high} high · {item.medium} medium · {item.low} low</span></div></div> : <WorkspaceEmpty title="No scans recorded." text="Run the first analysis to establish a baseline." action="#app/analyze" actionLabel="Create baseline" />}</section>;
}

function SettingsWorkspace() {
  return <section className="app-page"><div className="app-content-heading"><div><span className="eyebrow">Settings</span><h1>Keep the product honest as it gets more powerful.</h1><p>Configuration surfaces will be added when they control real behavior.</p></div><span className="app-build-label">FOUNDATION</span></div><div className="settings-grid"><div><span>Scan API</span><strong>{apiBaseUrl() ? "Configured" : "Not configured"}</strong><small>VITE_SCAN_API_URL</small></div><div><span>Viewports</span><strong>390 × 844 / 1440 × 900</strong><small>Initial deterministic matrix</small></div><div><span>AI layer</span><strong>Not connected</strong><small>Findings remain deterministic</small></div></div></section>;
}

function WorkspaceEmpty({ title, text, action, actionLabel }: { title: string; text: string; action: string; actionLabel: string }) {
  return <div className="shell-placeholder"><div className="shell-placeholder-mark" aria-hidden="true">00</div><div><span className="shell-placeholder-kicker">FOUNDATION STATE</span><h2>{title}</h2><p>{text}</p><a className="shell-inline-action" href={action}>{actionLabel} →</a></div></div>;
}

const legacySteps = [
  ["01", "Detect", "Measure the page across controlled viewports and find reproducible UI problems."],
  ["02", "Explain", "Turn raw measurements into language that anyone on the team can understand."],
  ["03", "Show", "Connect each finding to the viewport, measurement, and visual evidence behind it."],
  ["04", "Fix", "Give a practical starting point, then re-test to see whether the issue remains."],
];

function Logo() {
  return <a className="brand" href="#top" aria-label="Visibilio home"><img className="brand-logo" src="/Visibilio/visibilio-icon.svg" alt="" aria-hidden="true" /><span>Visibilio</span></a>;
}

function LandingPage() {
  const [url, setUrl] = useState("");
  return <div className="site" id="top">
    <header className="nav-wrap"><nav className="nav container"><Logo /><div className="nav-links"><a href="#how-it-works">Product</a><a href="#example">Evidence</a><a href="#principles">Principles</a></div><a className="nav-cta" href="#app/analyze">Analyze</a></nav></header>
    <main>
      <section className="hero container"><div className="hero-copy"><div className="hero-kicker"><span>VISIBILIO / UI AUDIT</span><span>01 — FIND THE ISSUE</span></div><h1>See what&apos;s wrong.<br />Fix what matters.</h1><p className="hero-subtitle">Visibilio finds real UI and responsive problems, explains what they mean, and shows you where to start fixing them.</p><div className="hero-actions"><a className="button button-primary" href="#app/analyze">Analyze a website</a><a className="button button-secondary" href="#example">See an example</a></div><div className="trust-row"><span>Measured</span><span>Responsive</span><span>Actionable</span></div></div><div className="hero-product hero-analysis"><div className="analysis-canvas"><div className="analysis-topline"><span>VISIBILIO AUDIT / SAMPLE</span><span>390 × 844</span></div><div className="page-preview"><div className="page-header-line"><span className="preview-logo" /><span className="preview-nav" /><span className="preview-nav short" /></div><div className="page-copy-line" /><div className="page-copy-line medium" /><div className="preview-content"><div className="preview-block" /><div className="preview-block small" /><div className="overflow-edge"><span>+34px</span></div></div></div><div className="analysis-rule"><span className="rule-marker">UI-001</span><div><strong>Horizontal overflow</strong><span>Document width exceeds the viewport.</span></div><span className="rule-value">424px</span></div><div className="analysis-footnote"><span>01 / FINDING</span><span>Measured, not guessed</span></div></div></div></section>
      <section className="scanner-section container"><div className="scanner-card"><div><span className="eyebrow eyebrow-light">Try the workflow</span><h2>Start with a URL. End with a clear next step.</h2><p>The public surface now hands analysis off to the workspace so real scan state has one home.</p></div><form className="scanner-form" onSubmit={(event) => { event.preventDefault(); window.location.hash = "app/analyze"; }}><label className="sr-only" htmlFor="landing-url">Website URL</label><input id="landing-url" type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://yourwebsite.com" required /><button className="button button-dark" type="submit">Open analysis</button></form><p className="scanner-note">The connected scanner is configured separately from the static landing page.</p></div></section>
      <section className="section container" id="how-it-works"><div className="section-heading"><span className="eyebrow">How it works</span><h2>From confusing UI bugs to understandable evidence.</h2></div><div className="steps">{legacySteps.map(([number,title,text]) => <article className="step" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
      <section className="section section-tinted container" id="example"><div className="example-grid"><div className="example-copy"><span className="eyebrow">Example finding</span><h2>Don&apos;t just say &quot;it breaks on mobile.&quot; Show why.</h2><p>Visibilio keeps evidence separate from interpretation so findings can be understood, challenged, and re-tested.</p><div className="evidence-list"><span>Viewport: 390 × 844</span><span>Document width: 424px</span><span>Overflow: +34px</span><span>Selector: .pricing-grid</span></div></div><div className="evidence-panel"><div className="mobile-frame"><div className="mobile-bar" /><div className="mobile-content"><div className="ghost-line wide" /><div className="ghost-line medium" /><div className="ghost-block" /><div className="overflow-marker">+34px overflow</div><div className="ghost-block smaller" /></div></div><div className="evidence-note"><strong>Evidence</strong><span>Measured mismatch between viewport and document width.</span></div></div></div></section>
      <section className="section container" id="principles"><div className="principles"><div><span className="eyebrow">Why Visibilio</span><h2>Useful enough for builders. Clear enough for everyone else.</h2></div><div className="principle-list"><div><strong>Evidence before opinion</strong><p>Measured facts lead. Recommendations stay clearly labeled.</p></div><div><strong>Simple by default</strong><p>Start with plain language, then expose selectors, values, and implementation detail.</p></div><div><strong>Action, not just detection</strong><p>Every finding should move someone toward understanding, fixing, or re-testing.</p></div></div></div></section>
      <section className="cta-section"><div className="container cta-inner"><div><span className="eyebrow">Visibilio</span><h2>See what&apos;s wrong. Fix what matters.</h2><p>Build from evidence you can inspect.</p></div><a className="button button-light" href="#app/analyze">Try the audit</a></div></section>
    </main>
    <footer className="footer"><div className="container footer-inner"><div><Logo /><p>Website UI analysis, built around evidence.</p></div><span>Early product preview · 2026</span></div></footer>
  </div>;
}

function App() {
  return getAppSection() ? <AppShell /> : <LandingPage />;
}

export default App;
