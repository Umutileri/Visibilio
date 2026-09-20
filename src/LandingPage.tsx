import { useEffect, useRef, useState } from "react";

const navLinks = [
  ["#product", "Product"],
  ["#how-it-works", "How it works"],
  ["#evidence", "Evidence"],
] as const;

type Language = "EN" | "TR";

const translations: Record<Language, Record<string, string>> = {
  EN: {
    product: "Product", how: "How it works", evidence: "Evidence", retest: "Re-test", workspace: "Open workspace", start: "Start for free",
    heroEyebrow: "Website UI quality, backed by evidence.", heroTitle: "See what’s wrong.<br />Fix what matters.",
    heroBody: "Find the UI problems that are easy to miss. Understand them. Fix them. Re-test them.",
    audience: "Built for developers, designers, and website owners.", audienceBody: "One workflow to find, understand, fix, and re-test the UI issues that matter.",
    startWebsite: "Start with your website", urlTitle: "Give us the URL.<br /><em>We’ll show you where to look.</em>",
    urlBody: "One place to start. Paste a page, run the check, and get a finding you can act on.", urlLabel: "Website URL", analyze: "Analyze", urlNote: "Start free · no setup tour required.",
    productEyebrow: "Why Visibilio", productTitle: "“Something feels off.”<br /><span>Now you can see why.</span>",
    productBody: "A website can look wrong without telling you why. Visibilio starts with what actually happened in the browser—not a score, not a guess.",
    productBody2: "That turns a vague problem into a finding with context: what broke, where it happened, what was measured, and what to investigate next.",
    audienceSection: "One product. Different reasons to use it.", audienceTitle: "Build it.<br /><em>Own it. Improve it.</em>", audienceSectionBody: "Visibilio gives each person behind a website the same useful starting point: a clear finding backed by evidence.",
    evidenceEyebrow: "Evidence first", evidenceTitle: "Know what was measured.<br /><em>Know what was suggested.</em>",
    retestEyebrow: "The outcome", retestTitle: "Know what changed.<br /><em>Not just what looked better.</em>",
    faqKicker: "Questions, answered.", faqTitle: "Frequently asked<br /><em>questions</em>",
    finalKicker: "Start free", finalTitle: "Give us a page.<br /><em>Get a clearer next step.</em>", finalBody: "Made for developers, designers, and anyone responsible for a website.", finalAction: "Start for free"
  },
  TR: {
    product: "Ürün", how: "Nasıl çalışır", evidence: "Kanıt", retest: "Yeniden test", workspace: "Çalışma alanı", start: "Ücretsiz başla",
    heroEyebrow: "Kanıtla desteklenen web sitesi arayüz kalitesi.", heroTitle: "Neyin yanlış olduğunu görün.<br />Önemli olanı düzeltin.",
    heroBody: "Kolayca gözden kaçan arayüz sorunlarını bulun. Anlayın, düzeltin ve yeniden test edin.",
    audience: "Geliştiriciler, tasarımcılar ve web sitesinden sorumlu herkes için.", audienceBody: "Önemli arayüz sorunlarını bulmak, anlamak, düzeltmek ve yeniden test etmek için tek akış.",
    startWebsite: "Web sitenizle başlayın", urlTitle: "URL'yi verin.<br /><em>Nereye bakacağınızı gösterelim.</em>",
    urlBody: "Başlamak için bir sayfa yapıştırın, kontrolü çalıştırın ve harekete geçebileceğiniz bir bulgu alın.", urlLabel: "Web sitesi URL'si", analyze: "Analiz et", urlNote: "Ücretsiz başla · kurulum turu gerekmez.",
    productEyebrow: "Neden Visibilio", productTitle: "“Bir şeyler yanlış.”<br /><span>Artık nedenini görebilirsiniz.</span>",
    productBody: "Bir web sitesi nedenini söylemeden yanlış görünebilir. Visibilio puan veya tahmin yerine tarayıcıda gerçekten olanla başlar.",
    productBody2: "Böylece belirsiz bir sorun; neyin bozulduğu, nerede olduğu, neyin ölçüldüğü ve sırada neye bakılması gerektiği belli olan bir bulguya dönüşür.",
    audienceSection: "Tek ürün. Farklı kullanım nedenleri.", audienceTitle: "Üretin.<br /><em>Sahiplenin. Geliştirin.</em>", audienceSectionBody: "Visibilio, web sitesinin arkasındaki herkes için aynı başlangıcı sunar: kanıtlarla desteklenen net bir bulgu.",
    evidenceEyebrow: "Önce kanıt", evidenceTitle: "Ne ölçüldüğünü bilin.<br /><em>Ne önerildiğini bilin.</em>",
    retestEyebrow: "Sonuç", retestTitle: "Neyin değiştiğini bilin.<br /><em>Sadece daha iyi görünmesine güvenmeyin.</em>",
    faqKicker: "Sorular, yanıtlar.", faqTitle: "Sık sorulan<br /><em>sorular</em>",
    finalKicker: "Ücretsiz başla", finalTitle: "Bir sayfa verin.<br /><em>Daha net bir sonraki adım alın.</em>", finalBody: "Geliştiriciler, tasarımcılar ve web sitesinden sorumlu herkes için.", finalAction: "Ücretsiz başla"
  }
};

const featureSteps = [
  {
    id: "detect",
    index: "01",
    title: "See the issue before you chase it.",
    copy: "A controlled browser run finds measurable UI problems across the page—not a vague score.",
  },
  {
    id: "evidence",
    index: "02",
    title: "Know exactly what happened.",
    copy: "Each finding keeps its viewport, selector, and measured values attached to it.",
  },
  {
    id: "explain",
    index: "03",
    title: "Turn a finding into a decision.",
    copy: "AI helps translate evidence into clear next steps while the measured facts stay intact.",
  },
  {
    id: "retest",
    index: "04",
    title: "Fix it. Then measure again.",
    copy: "Re-run the same check and compare the before and after state.",
  },
];

function Brand() {
  return (
    <a className="landing-brand" href="#top" aria-label="Visibilio home">
      <img src="/Visibilio/visibilio-icon.svg" alt="" aria-hidden="true" />
      <span>Visibilio</span>
    </a>
  );
}

function HeroEvidence() {
  return (
    <div className="landing-hero-evidence" aria-label="Example Visibilio finding">
      <div className="landing-window-head">
        <span /><span /><span />
        <code>visibilio / findings / responsive</code>
      </div>
      <div className="landing-window-grid">
        <div className="landing-site-frame">
          <div className="landing-site-head">
            <b>your-site.com</b>
            <span>Mobile · 390 × 844</span>
          </div>
          <div className="landing-site-body">
            <i className="line line-a" />
            <i className="line line-b" />
            <div className="landing-site-cards"><i /><i /><i /></div>
            <div className="landing-overflow-callout">34 px overflow</div>
          </div>
        </div>
        <aside className="landing-evidence-card">
          <small>FINDING</small>
          <strong>Content exceeds viewport</strong>
          <b>34 px</b>
          <dl>
            <div><dt>viewport</dt><dd>390 px</dd></div>
            <div><dt>document</dt><dd>424 px</dd></div>
            <div><dt>selector</dt><dd>.pricing-grid</dd></div>
          </dl>
          <p>Measured in the browser.</p>
        </aside>
      </div>
    </div>
  );
}

function StepVisual({ id }: { id: string }) {
  if (id === "detect") {
    return (
      <div className="landing-demo landing-demo-detect">
        <div className="demo-page">
          <div className="demo-browser-head"><span>your-site.com</span><small>390 × 844</small></div>
          <div className="demo-content-lines"><i /><i /><i /></div>
          <div className="demo-overflow-box"><span>+34 px</span></div>
        </div>
        <div className="demo-note">
          <small>FOUND</small>
          <strong>Content extends beyond the viewport.</strong>
          <span>responsive.horizontal-overflow</span>
        </div>
      </div>
    );
  }

  if (id === "evidence") {
    return (
      <div className="landing-demo landing-demo-evidence">
        <div className="evidence-heading-row"><span>MEASUREMENT</span><b>mobile / 390 × 844</b></div>
        <div className="evidence-inspector">
          <div><small>viewportWidth</small><strong>390</strong><em>px</em></div>
          <div><small>documentWidth</small><strong>424</strong><em>px</em></div>
          <div><small>horizontalOverflow</small><strong>34</strong><em>px</em></div>
          <div><small>selector</small><strong>.pricing-grid</strong></div>
        </div>
        <div className="evidence-ruler"><span>viewport</span><i /><b>+34 px</b></div>
      </div>
    );
  }

  if (id === "explain") {
    return (
      <div className="landing-demo landing-demo-explain">
        <div className="explain-block">
          <small>CONFIRMED FACT</small>
          <strong>Document width is larger than the tested viewport.</strong>
          <span>Evidence source · browser measurement</span>
        </div>
        <div className="explain-block explain-ai">
          <small>AI CONTEXT</small>
          <p>This can create horizontal scrolling on smaller screens. Check fixed-width children and grid sizing first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-demo landing-demo-retest">
      <div className="retest-column">
        <small>BEFORE</small>
        <strong>34 px</strong>
        <span>overflow</span>
      </div>
      <div className="retest-center">
        <span>FIX</span>
        <b>→</b>
        <small>RUN THE SAME CHECK</small>
      </div>
      <div className="retest-column retest-after">
        <small>AFTER</small>
        <strong>0 px</strong>
        <span>within viewport</span>
      </div>
    </div>
  );
}


function ProductProof() {
  const proofItems = [
    ["01", "Find", "See measurable issues before they become another debugging session."],
    ["02", "Understand", "Get the browser context, affected element, and evidence in one place."],
    ["03", "Improve", "Make the change, re-run the same check, and see what actually moved."],
  ];

  return (
    <section className="landing-proof-section">
      <div className="landing-container">
        <div className="landing-proof-heading">
          <div className="landing-proof-intro">
            <span className="landing-section-kicker">{t.productEyebrow}</span>
            <span className="landing-display-label">02</span>
          </div>
          <div>
            <h2>From a vague feeling<br /><em>to a useful answer.</em></h2>
            <p className="landing-proof-lead">One clear workflow for anyone responsible for a website: find the issue, understand the evidence, then improve it.</p>
          </div>
        </div>
        <div className="landing-proof-list">
          {proofItems.map(([number, title, copy]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AudienceBlock() {
  return (
    <section className="landing-audience-section">
      <div className="landing-container">
        <div className="landing-audience-intro">
          <span className="landing-section-kicker">One product. Different reasons to use it.</span>
          <h2>Build it.<br /><em>Own it. Improve it.</em></h2>
          <p>Visibilio gives each person behind a website the same useful starting point: a clear finding backed by evidence.</p>
        </div>
        <div className="landing-audience-grid">
          <article>
            <span>DEVELOPERS</span>
            <h3>Find the bug faster.</h3>
            <p>Get viewport measurements, selectors, rule details, and evidence you can reproduce.</p>
            <a href="#how-it-works">Explore the workflow →</a>
          </article>
          <article>
            <span>WEBSITE OWNERS</span>
            <h3>Know what deserves attention.</h3>
            <p>See the issue in plain language before you need to understand the implementation.</p>
            <a href="#evidence">See what we measure →</a>
          </article>
          <article>
            <span>DESIGNERS</span>
            <h3>See the context behind the page.</h3>
            <p>Connect visual observations to the tested viewport and the evidence underneath them.</p>
            <a href="#product">See how Visibilio thinks →</a>
          </article>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const items = [
    ["What does Visibilio actually check?", "Visibilio measures real browser behavior and surfaces UI issues such as responsive overflow and accessibility problems, with the viewport, selector, and measurements attached to each finding."],
    ["Who is Visibilio for?", "Developers, designers, website owners, and anyone responsible for a website can use the same evidence-first workflow to find, understand, fix, and re-test UI issues."],
    ["Do I need to install anything?", "No. Start with a URL and Visibilio handles the scan workflow for you."],
    ["Is the AI the source of the finding?", "No. Browser measurements and deterministic rules establish the finding. AI is used to explain the evidence and suggest what to investigate next."],
    ["Can I re-test after fixing an issue?", "Yes. Re-test the same rule, selector, and viewport to compare the before and after measurements."],
    ["Is there a free way to try it?", "The product is designed to start with a lightweight free experience so you can see the workflow before committing to a paid plan."],
  ];

  return (
    <section className="landing-faq-section" id="faq">
      <div className="landing-container landing-faq-grid">
        <div className="landing-faq-title">
          <span className="landing-section-kicker">Questions, answered.</span>
          <h2>Frequently asked<br /><em>questions</em></h2>
        </div>
        <div className="landing-faq-list">
          {items.map(([question, answer], index) => (
            <details key={question} open={index === 0}>
              <summary>{question}<span>+</span></summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState<Language>(() => window.localStorage.getItem("visibilio-language") === "TR" ? "TR" : "EN");
  const t = translations[language];
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    document.documentElement.lang = language.toLowerCase();
    window.localStorage.setItem("visibilio-language", language);
  }, [language]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries.filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!current) return;
        const next = Number((current.target as HTMLElement).dataset.step);
        if (!Number.isNaN(next)) setActiveStep(next);
      },
      { threshold: [0.35, 0.6, 0.8], rootMargin: "-16% 0px -20% 0px" },
    );
    stepRefs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const openApp = () => {
    window.location.hash = "#app/analyze";
    setMenuOpen(false);
  };


  return (
    <div className="landing-page" id="top">
      <header className="landing-nav-wrap">
        <div className="landing-nav">
          <Brand />
          <nav className={menuOpen ? "landing-nav-links is-open" : "landing-nav-links"} aria-label="Main navigation">
            {navLinks.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
            <a href="#retest" onClick={() => setMenuOpen(false)}>{t.retest}</a>
          </nav>
          <div className="landing-nav-actions">
          <div className="landing-language-switcher" aria-label="Language">
            <button type="button" className={language === "EN" ? "is-active" : ""} onClick={() => setLanguage("EN")}>EN</button><span>/</span><button type="button" className={language === "TR" ? "is-active" : ""} onClick={() => setLanguage("TR")}>TR</button>
            <button type="button" className={language === "EN" ? "is-active" : ""} onClick={() => setLanguage("EN")}>EN</button>
            <span>/</span>
            <button type="button" className={language === "TR" ? "is-active" : ""} onClick={() => setLanguage("TR")}>TR</button>
          </div>
            <a className="landing-signin" href="#app/overview">{t.workspace}</a>
            <button className="landing-cta" type="button" onClick={openApp}>{t.start}</button>
            <button className="landing-menu-button" type="button" aria-expanded={menuOpen} aria-label="Toggle navigation" onClick={() => setMenuOpen((value) => !value)}><span /><span /></button>
          </div>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-container landing-hero-grid">
            <div className="landing-hero-copy">
              <span className="landing-eyebrow">{copy.eyebrow}</span>
              <h1 dangerouslySetInnerHTML={{ __html: copy.hero }} />
              <p>{copy.heroBody}</p>
              <div className="landing-hero-actions">
                <button className="landing-primary" type="button" onClick={openApp}>Analyze your website <span>↗</span></button>
                <a className="landing-secondary" href="#how-it-works">See how it works <span>↓</span></a>
              </div>
              <div className="landing-hero-note landing-audience-callout">
                <strong>{copy.audience}</strong>
                <span>One workflow to find, understand, fix, and re-test the UI issues that matter.</span>
              </div>
            </div>
            <div>
              <HeroEvidence />
              <div className="landing-proof-caption"><span>01 / WHAT YOU GET</span><strong>A finding you can actually act on.</strong></div>
            </div>
          </div>
        </section>

        <section className="landing-share-section landing-url-section">
          <div className="landing-container landing-share-grid landing-share-dark">
            <div className="landing-url-copy">
              <span className="landing-section-kicker">{copy.startWebsite}</span>
              <h2 dangerouslySetInnerHTML={{ __html: copy.giveUrl }} />
              <p>{copy.urlBody}</p>
              <div className="landing-url-audience">
                <span>Developers</span>
                <span>Designers</span>
                <span>Website owners</span>
              </div>
            </div>
            <form className="landing-url-form" onSubmit={(event) => { event.preventDefault(); openApp(); }}>
              <label htmlFor="landing-url">{copy.urlLabel}</label>
              <div className="landing-url-field">
                <input id="landing-url" type="url" name="url" inputMode="url" autoComplete="url" placeholder="https://your-site.com/pricing" required />
                <button type="submit">{copy.analyze} <span>↗</span></button>
              </div>
              <small>{copy.freeNote}</small>
            </form>
          </div>
        </section>

        <section className="landing-intro-section" id="product">
          <div className="landing-container landing-two-col">
            <div className="landing-section-side">
              <span className="landing-eyebrow">Why Visibilio</span>
              <span className="landing-display-label">01</span>
            </div>
            <div className="landing-prose landing-prose-large">
              <h2 dangerouslySetInnerHTML={{__html:t.productTitle}} />
              <p>{t.productBody}</p>
              <p>{t.productBody2}</p>
            </div>
          </div>
        </section>

        <section className="landing-feature-section" id="how-it-works">
          <div className="landing-container landing-feature-layout">
            <div className="landing-feature-sticky">
              <span className="landing-section-kicker">How it works</span>
              <div className="landing-feature-title">
                <span>{featureSteps[activeStep].index} / 04</span>
                <h2>{featureSteps[activeStep].title}</h2>
                <p>{featureSteps[activeStep].copy}</p>
              </div>
              <div className="landing-feature-nav" aria-label="Feature steps">
                {featureSteps.map((step, index) => (
                  <button key={step.id} className={index === activeStep ? "is-active" : ""} type="button" onClick={() => stepRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" })}>
                    <span>{step.index}</span><strong>{step.title}</strong>
                  </button>
                ))}
              </div>
            </div>
            <div className="landing-feature-scroll">
              {featureSteps.map((step, index) => (
                <div key={step.id} className="landing-feature-step" data-step={index} ref={(node) => { stepRefs.current[index] = node; }}>
                  <div className="landing-feature-art">
                    <div className="landing-feature-chrome"><span>{step.index} / {step.title}</span><span>VISIBILIO</span></div>
                    <StepVisual id={step.id} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ProductProof />
        <AudienceBlock />

        <section className="landing-evidence-section" id="evidence">
          <div className="landing-container landing-evidence-feature">
            <div className="landing-section-heading">
              <span className="landing-section-kicker">{language === "TR" ? "Önce kanıt" : "Evidence first"}</span>
              <span className="landing-display-label">03</span>
              <h2>{language === "TR" ? <>Ne ölçüldüğünü bilin.<br /><em>Ne önerildiğini bilin.</em></> : <>Know what was measured.<br /><em>Know what was suggested.</em></>}</h2>
              <p>Visibilio keeps browser evidence, deterministic findings, and AI context visibly separate—so a useful suggestion never gets mistaken for a measured fact.</p>
            </div>
            <div className="landing-evidence-contrast">
              <div><small>OBSERVED</small><strong>34 px horizontal overflow</strong><span>viewport: 390 × 844 · selector: .pricing-grid</span></div>
              <div><small>INTERPRETED</small><strong>Check fixed-width children and grid sizing first.</strong><span>AI-generated context · not a measurement</span></div>
            </div>
          </div>
        </section>

        <section className="landing-retest-section" id="retest">
          <div className="landing-container landing-retest-story">
            <div>
              <span className="landing-section-kicker">{language === "TR" ? "Sonuç" : "The outcome"}</span>
              <h2>{language === "TR" ? <>Neyin değiştiğini bilin.<br /><em>Sadece daha iyi görünmesine güvenmeyin.</em></> : <>Know what changed.<br /><em>Not just what looked better.</em></>}</h2>
              <p>A re-test gives you a concrete before-and-after result, so improvement is something you can inspect.</p>
              <button className="landing-primary" type="button" onClick={openApp}>Analyze your website <span>↗</span></button>
            </div>
            <div className="landing-retest-visual">
              <div className="result-before"><small>BEFORE</small><b>34 px</b><span>overflow</span></div>
              <div className="result-divider"><span>FIX</span><i>→</i></div>
              <div className="result-after"><small>AFTER</small><b>0 px</b><span>within viewport</span></div>
              <div className="result-foot">Same rule · same viewport · measured again</div>
            </div>
          </div>
        </section>

        <FAQSection />

        <section className="landing-final-section">
          <div className="landing-container landing-final-grid">
            <div>
              <span className="landing-section-kicker">{language === "TR" ? "Ücretsiz başla" : "Start free"}</span>
              <h2>{language === "TR" ? <>Bir sayfa verin.<br /><em>Daha net bir sonraki adım alın.</em></> : <>Give us a page.<br /><em>Get a clearer next step.</em></>}</h2>
              <p>{language === "TR" ? "Geliştiriciler, tasarımcılar ve web sitesinden sorumlu herkes için." : "Made for developers, designers, and anyone responsible for a website."}</p>
            </div>
            <div className="landing-final-action"><button className="landing-primary landing-primary-light" type="button" onClick={openApp}>Start for free <span>↗</span></button><small>Start with a URL. No complicated setup.</small></div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-grid">
          <div><Brand/><p>Website UI quality, backed by evidence.</p></div>
          <div className="landing-footer-links">{navLinks.map(([href,label])=><a key={href} href={href}>{label}</a>)}<a href="#retest">{copy.retest}</a><a href="#app/overview">Workspace</a></div>
          <small>Visibilio · 2026</small>
        </div>
      </footer>
    </div>
  );
}
