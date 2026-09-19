import { useEffect, useMemo, useState } from "react";

type AppSection =
  | "overview"
  | "analyze"
  | "findings"
  | "evidence"
  | "history"
  | "settings";

const appSections: Array<{
  id: AppSection;
  label: string;
  description: string;
}> = [
  { id: "overview", label: "Overview", description: "Your audit workspace" },
  { id: "analyze", label: "Analyze", description: "Start a new audit" },
  { id: "findings", label: "Findings", description: "Review detected issues" },
  { id: "evidence", label: "Evidence", description: "Inspect measurements" },
  { id: "history", label: "History", description: "Compare past scans" },
  { id: "settings", label: "Settings", description: "Workspace preferences" },
];

const sectionContent: Record<
  AppSection,
  { eyebrow: string; title: string; description: string }
> = {
  overview: {
    eyebrow: "Workspace",
    title: "See the state of your website.",
    description:
      "Your audit workspace will keep scans, findings, and evidence in one predictable place.",
  },
  analyze: {
    eyebrow: "New audit",
    title: "Start with a website URL.",
    description:
      "The analysis flow will validate the target, scan controlled viewports, and return evidence-backed findings.",
  },
  findings: {
    eyebrow: "Findings",
    title: "Review what needs attention.",
    description:
      "Findings will be grouped by severity and category, with the evidence behind each result kept close at hand.",
  },
  evidence: {
    eyebrow: "Evidence",
    title: "Inspect the measurement behind a finding.",
    description:
      "Viewport, selector, measurements, and visual evidence will be progressively revealed without burying the main finding.",
  },
  history: {
    eyebrow: "History",
    title: "Track how audits change over time.",
    description:
      "Past scans will become the baseline for before-and-after comparisons and re-test workflows.",
  },
  settings: {
    eyebrow: "Settings",
    title: "Keep your workspace predictable.",
    description:
      "Account, project, notification, and analysis preferences will live here as the product grows.",
  },
};

function getAppSection(): AppSection | null {
  const match = window.location.hash.match(/^#app\/(.+)$/);
  const section = match?.[1] as AppSection | undefined;

  return section && appSections.some((item) => item.id === section)
    ? section
    : null;
}

function AppShell() {
  const [section, setSection] = useState<AppSection>(
    getAppSection() ?? "overview",
  );
  const activeSection = useMemo(
    () => appSections.find((item) => item.id === section) ?? appSections[0],
    [section],
  );

  useEffect(() => {
    const handleHashChange = () => setSection(getAppSection() ?? "overview");

    window.addEventListener("hashchange", handleHashChange);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar-top">
          <a
            className="shell-brand"
            href="#app/overview"
            aria-label="Visibilio overview"
          >
            <img
              className="shell-brand-logo"
              src="/Visibilio/visibilio-icon.svg"
              alt=""
              aria-hidden="true"
            />
            <span>Visibilio</span>
          </a>

          <div className="workspace-switcher">
            <span className="workspace-mark" aria-hidden="true">
              V
            </span>
            <div>
              <strong>My workspace</strong>
              <span>Personal</span>
            </div>
          </div>
        </div>

        <nav className="app-nav" aria-label="Product navigation">
          <span className="app-nav-label">Workspace</span>
          {appSections.map((item) => (
            <a
              className={`app-nav-item ${item.id === activeSection.id ? "is-active" : ""}`}
              href={`#app/${item.id}`}
              key={item.id}
              aria-current={item.id === activeSection.id ? "page" : undefined}
            >
              <span className="app-nav-glyph" aria-hidden="true">
                {item.label.charAt(0)}
              </span>
              <span>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
            </a>
          ))}
        </nav>

        <div className="app-sidebar-footer">
          <a href="#principles">View product principles</a>
          <span className="shell-status">
            <i aria-hidden="true" /> Early product
          </span>
        </div>
      </aside>

      <main className="app-main">
        <header className="app-header">
          <div className="app-breadcrumbs">
            <span>Workspace</span>
            <span aria-hidden="true">/</span>
            <strong>{activeSection.label}</strong>
          </div>
          <div className="app-header-actions">
            <a className="shell-header-home" href="#top">
              Exit workspace
            </a>
            <a className="shell-header-action" href="#app/analyze">
              New analysis
            </a>
          </div>
        </header>

        <div className="app-content">
          <div className="app-content-heading">
            <div>
              <span className="eyebrow">
                {sectionContent[activeSection.id].eyebrow}
              </span>
              <h1>{sectionContent[activeSection.id].title}</h1>
              <p>{sectionContent[activeSection.id].description}</p>
            </div>
            <span className="app-build-label">MVP / FOUNDATION</span>
          </div>

          {activeSection.id === "analyze" ? (
            <AnalyzeEntry />
          ) : activeSection.id === "findings" ? (
            <FindingsPreview />
          ) : (
            <WorkspacePlaceholder section={activeSection.id} />
          )}
        </div>
      </main>

      <nav className="app-mobile-nav" aria-label="Mobile product navigation">
        {appSections.map((item) => (
          <a
            className={item.id === activeSection.id ? "is-active" : ""}
            href={`#app/${item.id}`}
            key={item.id}
            aria-current={item.id === activeSection.id ? "page" : undefined}
          >
            <span aria-hidden="true">{item.label.charAt(0)}</span>
            <small>{item.label}</small>
          </a>
        ))}
      </nav>
    </div>
  );
}

function AnalyzeEntry() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<
    "idle" | "validating" | "scanning" | "completed" | "failed"
  >("idle");

  const stages = [
    { id: "validating", label: "Validate target" },
    { id: "scanning", label: "Scan configured viewports" },
    { id: "completed", label: "Prepare findings" },
  ];

  function validateTarget(rawUrl: string): boolean {
    try {
      const target = new URL(rawUrl.trim());
      return target.protocol === "http:" || target.protocol === "https:";
    } catch {
      return false;
    }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!url.trim() || status === "validating" || status === "scanning") return;

    setStatus("validating");

    window.setTimeout(() => {
      if (!validateTarget(url)) {
        setStatus("failed");
        return;
      }

      setStatus("scanning");
    }, 650);

    window.setTimeout(() => {
      setStatus((current) => (current === "scanning" ? "completed" : current));
    }, 1450);
  }

  function reset() {
    setStatus("idle");
  }

  const activeStage =
    status === "completed"
      ? 3
      : status === "scanning"
        ? 2
        : status === "validating"
          ? 1
          : 0;

  return (
    <section className="analyze-entry">
      <div className="analyze-entry-copy">
        <span className="shell-step">01 / TARGET</span>
        <h2>What should we inspect?</h2>
        <p>
          This workflow is wired as a product state machine only. Public URL
          scanning stays disconnected until the server-side security boundary is ready.
        </p>

        <div className="scan-stages" aria-label="Analysis stages">
          {stages.map((stage, index) => (
            <div
              className={`scan-stage ${index < activeStage ? "is-done" : ""} ${index === activeStage - 1 ? "is-current" : ""}`}
              key={stage.id}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{stage.label}</strong>
                <small>
                  {index === 0
                    ? "Check the target before any browser work."
                    : index === 1
                      ? "Run the configured viewport matrix."
                      : "Normalize structured findings for the workspace."}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="shell-url-panel">
        {status === "completed" ? (
          <div className="scan-state scan-state-success" aria-live="polite">
            <span className="scan-state-label">Analysis ready</span>
            <h3>Target accepted for the next scan layer.</h3>
            <p>
              The UI flow is complete, but no production result has been created.
              Connect this state to the secure scan API in the next milestone.
            </p>
            <div className="scan-state-meta">
              <span>{url}</span>
              <span>2 configured viewports</span>
            </div>
            <button type="button" onClick={reset}>
              Start again
            </button>
          </div>
        ) : status === "failed" ? (
          <div className="scan-state scan-state-error" aria-live="assertive">
            <span className="scan-state-label">Validation failed</span>
            <h3>That target cannot be used for this analysis flow.</h3>
            <p>
              Use a complete HTTP or HTTPS URL and try again. No network request
              was made from this product preview.
            </p>
            <div className="scan-state-meta">
              <span>{url || "No target entered"}</span>
              <span>Expected: http:// or https://</span>
            </div>
            <button type="button" onClick={reset}>
              Edit target
            </button>
          </div>
        ) : (
          <form className="shell-url-form" onSubmit={submit}>
            <label htmlFor="workspace-url">Website URL</label>
            <div className="shell-url-row">
              <input
                id="workspace-url"
                type="url"
                value={url}
                onChange={(event) => {
                  setUrl(event.target.value);
                  if (status !== "idle") setStatus("idle");
                }}
                placeholder="https://example.com"
                required
                disabled={status === "validating" || status === "scanning"}
              />
              <button
                type="submit"
                disabled={!url.trim() || status === "validating" || status === "scanning"}
              >
                {status === "validating"
                  ? "Validating…"
                  : status === "scanning"
                    ? "Scanning…"
                    : "Start analysis"}
              </button>
            </div>
            <span className="shell-form-note">
              {status === "validating"
                ? "Checking the target and preparing the scan."
                : status === "scanning"
                  ? "Simulating the scan stage in the product shell."
                  : "No request is sent yet. This is the B2 UI foundation."}
            </span>
          </form>
        )}
      </div>
    </section>
  );
}

import type { IssueSeverity, UIssue } from "./scanner/types";

const previewFindings: UIssue[] = [
  {
    id: "preview-overflow",
    rule: "responsive.horizontal-overflow",
    category: "responsive",
    title: "Horizontal overflow detected",
    severity: "high",
    description: "A section extends beyond the viewport on a mobile layout.",
    url: "https://example.com",
    viewport: { name: "Mobile", width: 390, height: 844 },
    selector: ".pricing-grid",
    measurements: { documentWidth: 424, viewportWidth: 390, overflow: 34 },
    evidence: [
      { type: "measurement", metric: "horizontalOverflow", value: 34, unit: "px" },
    ],
    detectedAt: "2026-01-01T00:00:00.000Z",
    status: "open",
  },
  {
    id: "preview-alt",
    rule: "accessibility.image-alt",
    category: "accessibility",
    title: "Image is missing alternative text",
    severity: "medium",
    description: "An image does not expose an accessible text alternative.",
    url: "https://example.com",
    viewport: { name: "Desktop", width: 1440, height: 900 },
    selector: "img#hero-image",
    detectedAt: "2026-01-01T00:00:00.000Z",
    status: "open",
  },
  {
    id: "preview-label",
    rule: "accessibility.form-control-name",
    category: "accessibility",
    title: "Form control has no accessible name",
    severity: "medium",
    description: "A form input cannot be identified by assistive technology.",
    url: "https://example.com",
    viewport: { name: "Mobile", width: 390, height: 844 },
    selector: "input#email",
    detectedAt: "2026-01-01T00:00:00.000Z",
    status: "open",
  },
];

function FindingsPreview() {
  const [severity, setSeverity] = useState<"all" | IssueSeverity>("all");
  const [category, setCategory] = useState<
    "all" | "responsive" | "accessibility" | "layout"
  >("all");
  const [selectedId, setSelectedId] = useState(previewFindings[0].id);

  const visibleFindings = previewFindings.filter((finding) => {
    const severityMatches = severity === "all" || finding.severity === severity;
    const categoryMatches = category === "all" || finding.category === category;
    return severityMatches && categoryMatches;
  });

  const selected =
    visibleFindings.find((finding) => finding.id === selectedId) ??
    visibleFindings[0];

  const severityCounts = {
    high: previewFindings.filter((finding) => finding.severity === "high").length,
    medium: previewFindings.filter((finding) => finding.severity === "medium").length,
    low: previewFindings.filter((finding) => finding.severity === "low").length,
  };

  return (
    <section className="findings-workspace">
      <div className="findings-summary">
        <div>
          <span className="shell-step">02 / FINDINGS</span>
          <h2>Review the issues, then open the evidence.</h2>
        </div>
        <div className="findings-summary-count">
          <strong>{previewFindings.length}</strong>
          <span>sample findings</span>
        </div>
      </div>

      <div className="finding-severity-strip" aria-label="Finding counts">
        <span>All <strong>{previewFindings.length}</strong></span>
        <span>High <strong>{severityCounts.high}</strong></span>
        <span>Medium <strong>{severityCounts.medium}</strong></span>
        <span>Low <strong>{severityCounts.low}</strong></span>
      </div>

      <div className="findings-toolbar" aria-label="Finding filters">
        <label>
          <span>Severity</span>
          <select
            value={severity}
            onChange={(event) =>
              setSeverity(event.target.value as typeof severity)
            }
          >
            <option value="all">All severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>

        <label>
          <span>Category</span>
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as typeof category)
            }
          >
            <option value="all">All categories</option>
            <option value="responsive">Responsive</option>
            <option value="accessibility">Accessibility</option>
            <option value="layout">Layout</option>
          </select>
        </label>

        <span className="findings-toolbar-note">
          Sample UI only · not a scan result
        </span>
      </div>

      <div className="findings-grid">
        <div className="finding-list" aria-label="Sample findings">
          {visibleFindings.length ? (
            visibleFindings.map((finding) => (
              <button
                type="button"
                className={`finding-row ${selectedId === finding.id ? "is-selected" : ""}`}
                key={finding.id}
                onClick={() => setSelectedId(finding.id)}
              >
                <span
                  className={`severity-dot severity-dot-${finding.severity}`}
                  aria-hidden="true"
                />
                <span className="finding-row-copy">
                  <strong>{finding.title}</strong>
                  <small>
                    {finding.category} · {finding.viewport.name}
                  </small>
                </span>
                <span className="finding-chevron" aria-hidden="true">
                  →
                </span>
              </button>
            ))
          ) : (
            <div className="finding-list-empty">
              <strong>No findings match these filters.</strong>
              <span>Try another severity or category.</span>
            </div>
          )}
        </div>

        <aside className="finding-detail" aria-live="polite">
          {selected ? (
            <>
              <div className="finding-detail-top">
                <span
                  className={`severity-badge severity-badge-${selected.severity}`}
                >
                  {selected.severity}
                </span>
                <span>{selected.category}</span>
              </div>

              <h3>{selected.title}</h3>
              <p>{selected.description}</p>

              <div className="finding-evidence-box">
                <span>Measured evidence</span>
                <strong>
                  {selected.evidence?.[0]?.value}
                  {selected.evidence?.[0]?.unit}{" "}
                  {selected.evidence?.[0]?.metric === "horizontalOverflow"
                    ? "horizontal overflow"
                    : "measured value"}
                </strong>
              </div>

              <div className="finding-detail-meta">
                <span>Viewport</span>
                <strong>
                  {selected.viewport.width} × {selected.viewport.height}
                </strong>
              </div>

              <div className="finding-detail-meta">
                <span>Selector</span>
                <strong>{selected.selector ?? "Not available"}</strong>
              </div>

              <div className="finding-detail-meta">
                <span>Source</span>
                <strong>Deterministic rule</strong>
              </div>
            </>
          ) : (
            <div className="finding-detail-empty">
              Select a finding to inspect its details.
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}



function WorkspacePlaceholder({ section }: { section: AppSection }) {
  const action =
    section === "overview"
      ? "Start an analysis"
      : section === "findings"
        ? "Run a new analysis"
        : section === "evidence"
          ? "Open findings"
          : section === "history"
            ? "Start first analysis"
            : null;

  return (
    <section className="shell-placeholder">
      <div className="shell-placeholder-mark" aria-hidden="true">
        {section === "overview" ? "00" : "—"}
      </div>
      <div>
        <span className="shell-placeholder-kicker">FOUNDATION STATE</span>
        <h2>
          {section === "history"
            ? "Your audit history starts here."
            : section === "findings"
              ? "No findings loaded yet."
              : section === "evidence"
                ? "Evidence becomes useful after a completed scan."
                : section === "settings"
                  ? "Workspace settings are not connected yet."
                  : "No analysis has been run yet."}
        </h2>
        <p>
          This surface is intentionally honest about the current product state.
          It does not render fabricated scan results or imply that the production
          scanner is already connected.
        </p>
        {action && (
          <a className="shell-inline-action" href="#app/analyze">
            {action}
          </a>
        )}
      </div>
    </section>
  );
}

const demoIssues = [
  {
    title: "Horizontal overflow detected",
    description: "A section extends beyond the viewport on smaller screens.",
    severity: "High",
    evidence:
      "At 390px viewport width, the document is 34px wider than the visible page.",
    selector: ".pricing-grid",
  },
  {
    title: "Low text contrast",
    description: "Secondary text may be difficult to read on its current background.",
    severity: "Medium",
    evidence: "The current text color provides limited visual separation.",
    selector: ".muted-copy",
  },
  {
    title: "Dense mobile navigation",
    description: "Navigation controls may feel crowded on narrow screens.",
    severity: "Low",
    evidence:
      "The current layout leaves limited horizontal breathing room below 640px.",
    selector: ".site-nav",
  },
];

const steps = [
  [
    "01",
    "Detect",
    "Measure the page across controlled viewports and find reproducible UI problems.",
  ],
  [
    "02",
    "Explain",
    "Turn raw measurements into language that anyone on the team can understand.",
  ],
  [
    "03",
    "Show",
    "Connect each finding to the viewport, measurement, and visual evidence behind it.",
  ],
  [
    "04",
    "Fix",
    "Give a practical starting point, then re-test to see whether the issue remains.",
  ],
];

function Logo() {
  return (
    <a className="brand" href="#top" aria-label="Visibilio home">
      <img
        className="brand-logo"
        src="/Visibilio/visibilio-icon.svg"
        alt=""
        aria-hidden="true"
      />
      <span>Visibilio</span>
    </a>
  );
}

function App() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const appSection = getAppSection();

  if (appSection) return <AppShell />;

  function handleScan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!url.trim()) return;

    setScanning(true);
    setShowDemo(false);

    window.setTimeout(() => {
      setScanning(false);
      setShowDemo(true);
    }, 900);
  }

  return (
    <div className="site" id="top">
      <header className="nav-wrap">
        <nav className="nav container">
          <Logo />

          <div className="nav-links">
            <a href="#how-it-works">Product</a>
            <a href="#example">Evidence</a>
            <a href="#principles">Principles</a>
          </div>

          <a className="nav-cta" href="#scanner">
            Analyze
          </a>
        </nav>
      </header>

      <main>
        <section className="hero container">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span>VISIBILIO / UI AUDIT</span>
              <span>01 — FIND THE ISSUE</span>
            </div>
            <h1>See what&apos;s wrong.<br />Fix what matters.</h1>
            <p className="hero-subtitle">
              Visibilio finds real UI and responsive problems, explains what they mean, and shows you
              where to start fixing them.
            </p>

            <div className="hero-actions">
              <a className="button button-primary" href="#scanner">
                Analyze a website
              </a>
              <a className="button button-secondary" href="#example">
                See an example
              </a>
            </div>

            <div className="trust-row">
              <span>Measured</span>
              <span>Responsive</span>
              <span>Actionable</span>
            </div>
          </div>

          <div className="hero-product hero-analysis" aria-label="Visibilio analysis evidence preview">
            <div className="analysis-canvas">
              <div className="analysis-topline">
                <span>VISIBILIO AUDIT / SAMPLE</span>
                <span>390 × 844</span>
              </div>

              <div className="page-preview">
                <div className="page-header-line">
                  <span className="preview-logo" />
                  <span className="preview-nav" />
                  <span className="preview-nav short" />
                </div>
                <div className="page-copy-line" />
                <div className="page-copy-line medium" />
                <div className="preview-content">
                  <div className="preview-block" />
                  <div className="preview-block small" />
                  <div className="overflow-edge">
                    <span>+34px</span>
                  </div>
                </div>
              </div>

              <div className="analysis-rule">
                <span className="rule-marker">UI-001</span>
                <div>
                  <strong>Horizontal overflow</strong>
                  <span>Document width exceeds the viewport.</span>
                </div>
                <span className="rule-value">424px</span>
              </div>

              <div className="analysis-footnote">
                <span>01 / FINDING</span>
                <span>Measured, not guessed</span>
              </div>
            </div>
          </div>
        </section>

        <section className="scanner-section container" id="scanner">
          <div className="scanner-card">
            <div>
              <span className="eyebrow eyebrow-light">Try the workflow</span>
              <h2>Start with a URL. End with a clear next step.</h2>
              <p>
                This is an early product preview. The same surface will later connect to Visibilio&apos;s
                real analysis engine.
              </p>
            </div>

            <form className="scanner-form" onSubmit={handleScan}>
              <label className="sr-only" htmlFor="url">
                Website URL
              </label>
              <input
                id="url"
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://yourwebsite.com"
                required
              />
              <button className="button button-dark" type="submit" disabled={scanning}>
                {scanning ? "Analyzing…" : "Analyze website"}
              </button>
            </form>

            <p className="scanner-note">No account required for the early product preview.</p>
          </div>

          {showDemo && (
            <div className="demo-result" aria-live="polite">
              <div className="demo-header">
                <div>
                  <span className="mini-label">Sample audit</span>
                  <h3>{url}</h3>
                </div>
                <span className="result-status">Analysis complete</span>
              </div>

              <div className="issues-list">
                {demoIssues.map((issue) => (
                  <article className="issue-card" key={issue.title}>
                    <div className="issue-card-top">
                      <span className={`severity-badge severity-badge-${issue.severity.toLowerCase()}`}>
                        {issue.severity}
                      </span>
                      <span className="issue-rule">UI-{String(demoIssues.indexOf(issue) + 1).padStart(3, "0")}</span>
                    </div>

                    <h4>{issue.title}</h4>
                    <p>{issue.description}</p>
                    <div className="issue-detail">{issue.evidence}</div>

                    <div className="issue-footer">
                      <span>{issue.selector}</span>
                      <span>Evidence attached</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="section container" id="how-it-works">
          <div className="section-heading">
            <span className="eyebrow">How it works</span>
            <h2>From confusing UI bugs to understandable evidence.</h2>
          </div>

          <div className="steps">
            {steps.map(([number, title, text]) => (
              <article className="step" key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section-tinted container" id="example">
          <div className="example-grid">
            <div className="example-copy">
              <span className="eyebrow">Example finding</span>
              <h2>Don&apos;t just say &quot;it breaks on mobile.&quot; Show why.</h2>
              <p>
                Visibilio keeps evidence separate from interpretation so findings can be understood,
                challenged, and re-tested.
              </p>

              <div className="evidence-list">
                <span>Viewport: 390 × 844</span>
                <span>Document width: 424px</span>
                <span>Overflow: +34px</span>
                <span>Selector: .pricing-grid</span>
              </div>
            </div>

            <div className="evidence-panel">
              <div className="mobile-frame">
                <div className="mobile-bar" />
                <div className="mobile-content">
                  <div className="ghost-line wide" />
                  <div className="ghost-line medium" />
                  <div className="ghost-block" />
                  <div className="overflow-marker">+34px overflow</div>
                  <div className="ghost-block smaller" />
                </div>
              </div>

              <div className="evidence-note">
                <strong>Evidence</strong>
                <span>Measured mismatch between viewport and document width.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section container" id="principles">
          <div className="principles">
            <div>
              <span className="eyebrow">Why Visibilio</span>
              <h2>Useful enough for builders. Clear enough for everyone else.</h2>
            </div>

            <div className="principle-list">
              <div>
                <strong>Evidence before opinion</strong>
                <p>Measured facts lead. Subjective recommendations stay clearly labeled as suggestions.</p>
              </div>
              <div>
                <strong>Simple by default</strong>
                <p>Start with plain language, then expose selectors, values, and implementation detail when useful.</p>
              </div>
              <div>
                <strong>Action, not just detection</strong>
                <p>Every finding should help someone understand the problem and decide what to do next.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container cta-inner">
            <div>
              <span className="eyebrow">Visibilio</span>
              <h2>See what&apos;s wrong. Fix what matters.</h2>
              <p>Build a better web experience from evidence you can actually inspect.</p>
            </div>

            <a className="button button-light" href="#scanner">
              Try the audit
            </a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <Logo />
            <p>Website UI analysis, built around evidence.</p>
          </div>
          <span>Early product preview · 2026</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
