import { useEffect, useState } from "react";

const demoIssues = [
  {
    title: "Horizontal overflow detected",
    description: "A section extends beyond the viewport on smaller screens.",
    severity: "High",
    evidence: "At 390px viewport width, the document is 34px wider than the visible page.",
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
    evidence: "The current layout leaves limited horizontal breathing room below 640px.",
    selector: ".site-nav",
  },
];

const steps = [
  ["01", "Detect", "Measure the page across controlled viewports and find reproducible UI problems."],
  ["02", "Explain", "Turn raw measurements into language that anyone on the team can understand."],
  ["03", "Show", "Connect each finding to the viewport, measurement, and visual evidence behind it."],
  ["04", "Fix", "Give a practical starting point, then re-test to see whether the issue remains."],
];

function Logo() {
  return (
    <a className="brand" href="#top" aria-label="Visibilio home">
      <img className="brand-logo" src="/Visibilio/visibilio-icon.svg" alt="" aria-hidden="true" />
      <span>Visibilio</span>
    </a>
  );
}

const shellNav = [
  ["Overview", "#top", "⌂"],
  ["Analyze", "#scanner", "↗"],
  ["Findings", "#example", "◉"],
  ["Principles", "#principles", "◍"],
];

function ProductRail() {
  const [active, setActive] = useState("Overview");

  useEffect(() => {
    const sections = shellNav
      .map(([label, href]) => document.querySelector(href))
      .filter((section): section is HTMLElement => section instanceof HTMLElement);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          const match = shellNav.find(([, href]) => href === `#${visible.target.id}`);
          if (match) setActive(match[0]);
        }
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0.15, 0.35, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <aside className="product-rail" aria-label="Page navigation">
      <div className="rail-inner">
        <nav className="rail-items">
          {shellNav.map(([label, href, icon]) => (
            <a
              className={`rail-item${active === label ? " is-active" : ""}`}
              href={href}
              key={label}
              aria-label={label}
            >
              <span className="rail-icon" aria-hidden="true">{icon}</span>
              <span className="rail-label">{label}</span>
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}

function App() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

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
      <ProductRail />
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
