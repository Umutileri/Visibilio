import { useEffect, useRef, useState } from "react";

const navLinks = [
  ["#product", "product"],
  ["#how-it-works", "how"],
  ["#evidence", "evidence"],
] as const;

type Language = "EN" | "TR";

const translations: Record<Language, Record<string, string>> = {
  EN: {
    product: "Product", how: "How it works", evidence: "Evidence", retest: "Re-test", workspace: "Open workspace", start: "Start for free", heroAnalyze: "Analyze your website", seeHow: "See how it works",
    heroEyebrow: "Website UI quality, backed by evidence.", heroTitle: "See what’s wrong.<br /><em>Fix what matters.</em>",
    heroBody: "Find the UI problems that are easy to miss. Understand them. Fix them. Re-test them.", finding: "Finding", contentExceeds: "Content extends beyond viewport", mobile: "mobile", measuredBrowser: "Measured in a real browser.",
    audience: "Built for developers, designers, and website owners.", audienceBody: "One workflow to find, understand, fix, and re-test the UI issues that matter.",
    startWebsite: "Start with your website", urlTitle: "Give us the URL.<br /><em>We’ll show you where to look.</em>",
    urlBody: "One place to start. Paste a page, run the check, and get a finding you can act on.", urlLabel: "Website URL", analyze: "Analyze", urlNote: "Start free · no setup tour required.",
    productEyebrow: "Why Visibilio", productTitle: "“Something feels off.”<br /><span>Now you can see why.</span>",
    productBody: "A website can look wrong without telling you why. Visibilio starts with what actually happened in the browser—not a score, not a guess.",
    productBody2: "That turns a vague problem into a finding with context: what broke, where it happened, what was measured, and what to investigate next.", proofTitle: "From a vague feeling<br /><em>to a useful answer.</em>", proofLead: "One clear workflow for anyone responsible for a website: find the issue, understand the evidence, then improve it.", proofFind: "Find", proofFindCopy: "See measurable issues before they become another debugging session.", proofUnderstand: "Understand", proofUnderstandCopy: "Get the browser context, affected element, and evidence in one place.", proofImprove: "Improve", proofImproveCopy: "Make the change, re-run the same check, and see what actually moved.", audienceDevelopers:"Developers", audienceDevelopersTitle:"Find the bug faster.", audienceDevelopersCopy:"Get viewport measurements, selectors, rule details, and evidence you can reproduce.", audienceOwners:"Website owners", audienceOwnersTitle:"Know what deserves attention.", audienceOwnersCopy:"See the issue in plain language before you need to understand the implementation.", audienceDesigners:"Designers", audienceDesignersTitle:"See the context behind the page.", audienceDesignersCopy:"Connect visual observations to the tested viewport and the evidence underneath them.", audienceExplore:"Explore the workflow", evidenceLink:"See what we measure", productLink:"See how Visibilio thinks", whatYouGet:"01 / WHAT YOU GET", proofCaption:"A finding you can actually act on.", retestBefore:"BEFORE", retestAfter:"AFTER", retestOverflow:"overflow", retestWithin:"within viewport", retestFix:"FIX", retestRun:"RUN THE SAME CHECK", retestFoot:"Same rule · same viewport · measured again", finalSetup:"Start with a URL. No complicated setup.",
    audienceSection: "One product. Different reasons to use it.", audienceTitle: "Build it.<br /><em>Own it. Improve it.</em>", audienceSectionBody: "Visibilio gives each person behind a website the same useful starting point: a clear finding backed by evidence.",
    evidenceEyebrow: "Evidence first", demoSite: "your-site.com", demoMeasurement: "MEASUREMENT", demoMobile: "mobile", confirmedFact: "CONFIRMED FACT", aiContext: "AI CONTEXT", evidenceSource: "Evidence source · browser measurement", demoIssue: "Content extends beyond the viewport.", demoRule: "responsive.horizontal-overflow", aiCopy: "This can create horizontal scrolling on smaller screens. Check fixed-width children and grid sizing first.", viewport: "viewport", document: "document", selector: "selector", px: "px", evidenceTitle: "Know what was measured.<br /><em>Know what was suggested.</em>", evidenceBody: "Visibilio keeps browser evidence, deterministic findings, and AI context visibly separate—so a useful suggestion never gets mistaken for a measured fact.", resultBody: "A re-test gives you a concrete before-and-after result, so improvement is something you can inspect.", resultEyebrow: "The outcome", resultTitle: "Know what changed.<br /><em>Not just what looked better.</em>", finalEyebrow: "Start free", finalTitle: "Give us a page.<br /><em>Get a clearer next step.</em>", finalBodyCopy: "Made for developers, designers, and anyone responsible for a website.",
    retestEyebrow: "The outcome", retestTitle: "Know what changed.<br /><em>Not just what looked better.</em>",
    faqKicker: "Questions, answered.", faqTitle: "Frequently asked<br /><em>questions</em>", faqCheck:"What does Visibilio check?", faqCheckAnswer:"Visibilio measures real browser behavior and attaches viewport, selector, and measurement evidence to each finding.",
    finalKicker: "Start free", finalTitle: "Give us a page.<br /><em>Get a clearer next step.</em>", finalBody: "Made for developers, designers, and anyone responsible for a website.", finalAction: "Start for free"
  },
  TR: {
    product: "Ürün", how: "Nasıl çalışır", evidence: "Kanıt", retest: "Yeniden test", workspace: "Çalışma alanı", start: "Ücretsiz başla", heroAnalyze: "Siteyi analiz et", seeHow: "Nasıl çalışıyor?",
    heroEyebrow: "Kanıtla desteklenen web sitesi arayüz kalitesi.", heroTitle: "Sorunu görün.<br /><em>Önemli olanı düzeltin.</em>",
    heroBody: "Kolayca gözden kaçan arayüz sorunlarını bulun. Anlayın, düzeltin ve yeniden test edin.", finding: "Bulgu", contentExceeds: "İçerik görünüm alanını aşıyor", mobile: "mobil", measuredBrowser: "Gerçek tarayıcıda ölçüldü.",,
    audience: "Geliştiriciler, tasarımcılar ve web sitenizden sorumlu herkes için.", audienceBody: "Önemli arayüz sorunlarını bulmak, anlamak, düzeltmek ve yeniden test etmek için tek akış.",
    startWebsite: "Web sitenizle başlayın", urlTitle: "URL'yi verin.<br /><em>Nereye bakacağınızı gösterelim.</em>",
    urlBody: "Bir sayfa yapıştırın, kontrolü çalıştırın ve üzerinde harekete geçebileceğiniz net bir bulgu alın.", urlLabel: "Web sitesi URL'si", analyze: "Analiz et", urlNote: "Ücretsiz başla · kurulum turu gerekmez.",
    productEyebrow: "Neden Visibilio", productTitle: "“Bir şeyler yanlış.”<br /><span>Artık nedenini görebilirsiniz.</span>",
    productBody: "Bir web sitesi nedenini söylemeden yanlış görünebilir. Visibilio puan veya tahmin yerine tarayıcıda gerçekten olanla başlar.",
    productBody2: "Böylece belirsiz bir sorun; neyin bozulduğu, nerede olduğu, neyin ölçüldüğü ve sırada neye bakılması gerektiği belli olan bir bulguya dönüşür.", proofTitle: "Belirsiz bir histen<br /><em>işe yarar bir yanıta.</em>", proofLead: "Web sitesinden sorumlu herkes için tek bir akış: sorunu bulun, kanıtı anlayın ve geliştirin.", proofFind: "Bul", proofFindCopy: "Bir sonraki hata ayıklama turuna dönüşmeden ölçülebilen sorunları görün.", proofUnderstand: "Anla", proofUnderstandCopy: "Tarayıcı bağlamını, etkilenen öğeyi ve kanıtı tek yerde görün.", proofImprove: "Geliştir", proofImproveCopy: "Değişikliği yapın, aynı kontrolü yeniden çalıştırın ve gerçekten neyin değiştiğini görün.", audienceDevelopers:"Geliştiriciler", audienceDevelopersTitle:"Hatanın kaynağını daha hızlı bulun.", audienceDevelopersCopy:"Viewport ölçümlerini, selector bilgilerini, kural ayrıntılarını ve yeniden üretebileceğiniz kanıtı görün.", audienceOwners:"Web sitesi sahipleri", audienceOwnersTitle:"Neyin öncelikli olduğunu bilin.", audienceOwnersCopy:"Uygulama ayrıntılarına girmeden önce sorunu anlaşılır biçimde görün.", audienceDesigners:"Tasarımcılar", audienceDesignersTitle:"Sayfanın arkasındaki bağlamı görün.", audienceDesignersCopy:"Görsel gözlemleri test edilen viewport ve altındaki kanıtla ilişkilendirin.", audienceExplore:"Akışı keşfedin", evidenceLink:"Neleri ölçtüğümüzü görün", productLink:"Visibilio yaklaşımını görün", whatYouGet:"01 / NE ALIRSINIZ", proofCaption:"Üzerinde gerçekten harekete geçebileceğiniz bir bulgu.", retestBefore:"ÖNCE", retestAfter:"SONRA", retestOverflow:"taşma", retestWithin:"viewport içinde", retestFix:"DÜZELT", retestRun:"AYNI KONTROLÜ TEKRAR ÇALIŞTIR", retestFoot:"Aynı kural · aynı viewport · yeniden ölçüldü", finalSetup:"Bir URL ile başlayın. Karmaşık kurulum yok."
    audienceSection: "Tek ürün. Farklı kullanım nedenleri.", audienceTitle: "Üretin.<br /><em>Sahiplenin. Geliştirin.</em>", audienceSectionBody: "Visibilio, web sitesinin arkasındaki herkes için aynı başlangıcı sunar: kanıtlarla desteklenen net bir bulgu.",
    evidenceEyebrow: "Önce kanıt", demoSite: "siteniz.com", demoMeasurement: "ÖLÇÜM", demoMobile: "mobil", confirmedFact: "DOĞRULANMIŞ GERÇEK", aiContext: "AI BAĞLAMI", evidenceSource: "Kanıt kaynağı · tarayıcı ölçümü", demoIssue: "İçerik görünüm alanını aşıyor.", demoRule: "responsive.horizontal-overflow", aiCopy: "Bu, küçük ekranlarda yatay kaydırma oluşturabilir. Önce sabit genişlikli öğeleri ve grid boyutlandırmasını kontrol edin.", viewport: "viewport", document: "belge", selector: "selector", px: "px", evidenceTitle: "Ne ölçüldüğünü bilin.<br /><em>Ne önerildiğini bilin.</em>", evidenceBody: "Visibilio tarayıcı kanıtını, deterministik bulguları ve AI bağlamını açıkça ayırır; böylece öneri ile ölçüm birbirine karışmaz.", resultBody: "Yeniden test, önceki ve sonraki durumu karşılaştırır; böylece iyileşmeyi gerçekten inceleyebilirsiniz.", resultEyebrow: "Sonuç", resultTitle: "Neyin değiştiğini bilin.<br /><em>Sadece daha iyi görünmesine güvenmeyin.</em>", finalEyebrow: "Ücretsiz başla", finalTitle: "Bir sayfa verin.<br /><em>Daha net bir sonraki adım alın.</em>", finalBodyCopy: "Geliştiriciler, tasarımcılar ve web sitenizden sorumlu herkes için.",
    retestEyebrow: "Sonuç", retestTitle: "Neyin değiştiğini bilin.<br /><em>Sadece daha iyi görünmesine güvenmeyin.</em>",
    faqKicker: "Sorular, yanıtlar.", faqTitle: "Sık sorulan<br /><em>sorular</em>", faqCheck:"Visibilio neyi kontrol ediyor?", faqCheckAnswer:"Visibilio gerçek tarayıcı davranışını ölçer ve her bulguya viewport, selector ve ölçüm kanıtını ekler.",
    finalKicker: "Ücretsiz başla", finalTitle: "Bir sayfa verin.<br /><em>Daha net bir sonraki adım alın.</em>", finalBody: "Geliştiriciler, tasarımcılar ve web sitenizden sorumlu herkes için.", finalAction: "Ücretsiz başla"
  }
};

function localizeFeatureSteps(language: Language) {
  return language === "TR"
    ? [
        { id: "detect", index: "01", title: "Sorunu peşine düşmeden önce görün.", copy: "Kontrollü tarayıcı çalıştırması, belirsiz bir puan yerine ölçülebilir arayüz sorunlarını bulur." },
        { id: "evidence", index: "02", title: "Tam olarak ne olduğunu bilin.", copy: "Her bulgu viewport, selector ve ölçülen değerleriyle birlikte tutulur." },
        { id: "explain", index: "03", title: "Bulguyu karara dönüştürün.", copy: "AI, ölçülen gerçekler sabit kalırken kanıtı anlaşılır sonraki adımlara çevirir." },
        { id: "retest", index: "04", title: "Düzeltin. Sonra tekrar ölçün.", copy: "Aynı kontrolü yeniden çalıştırın ve önceki ile sonraki durumu karşılaştırın." },
      ]
    : [
        { id: "detect", index: "01", title: "See the issue before you chase it.", copy: "A controlled browser run finds measurable UI problems across the page—not a vague score." },
        { id: "evidence", index: "02", title: "Know exactly what happened.", copy: "Each finding keeps its viewport, selector, and measured values attached to it." },
        { id: "explain", index: "03", title: "Turn a finding into a decision.", copy: "AI helps translate evidence into clear next steps while the measured facts stay intact." },
        { id: "retest", index: "04", title: "Fix it. Then measure again.", copy: "Re-run the same check and compare the before and after state." },
      ];
}

function Brand() {
  return (
    <a className="landing-brand" href="#top" aria-label="Visibilio home">
      <img src="/Visibilio/visibilio-icon.svg" alt="" aria-hidden="true" />
      <span>Visibilio</span>
    </a>
  );
}

function HeroEvidence({ t }: { t: Record<string, string> }) {
  return (
    <div className="landing-hero-evidence" aria-label={`${t.finding}: ${t.contentExceeds}`}>
      <div className="landing-window-head">
        <span /><span /><span />
        <code>visibilio / findings / responsive</code>
      </div>
      <div className="landing-window-grid">
        <div className="landing-site-frame">
          <div className="landing-site-head">
            <b>{t.demoSite}</b>
            <span>{t.mobile} · 390 × 844</span>
          </div>
          <div className="landing-site-body">
            <i className="line line-a" />
            <i className="line line-b" />
            <div className="landing-site-cards"><i /><i /><i /></div>
            <div className="landing-overflow-callout">34 {t.px} overflow</div>
          </div>
        </div>
        <aside className="landing-evidence-card">
          <small>{t.finding}</small>
          <strong>{t.contentExceeds}</strong>
          <b>34 px</b>
          <dl>
            <div><dt>{t.viewport}</dt><dd>390 px</dd></div>
            <div><dt>{t.document}</dt><dd>424 px</dd></div>
            <div><dt>{t.selector}</dt><dd>.pricing-grid</dd></div>
          </dl>
          <p>{t.measuredBrowser}</p>
        </aside>
      </div>
    </div>
  );
}

function StepVisual({ id, t }: { id: string; t: Record<string, string> }) {
  if (id === "detect") {
    return (
      <div className="landing-demo landing-demo-detect">
        <div className="demo-page">
          <div className="demo-browser-head"><span>{t.demoSite}</span><small>390 × 844</small></div>
          <div className="demo-content-lines"><i /><i /><i /></div>
          <div className="demo-overflow-box"><span>+34 px</span></div>
        </div>
        <div className="demo-note">
          <small>FOUND</small>
          <strong>{t.demoIssue}</strong>
          <span>{t.demoRule}</span>
        </div>
      </div>
    );
  }

  if (id === "evidence") {
    return (
      <div className="landing-demo landing-demo-evidence">
        <div className="evidence-heading-row"><span>{t.demoMeasurement}</span><b>{t.demoMobile} / 390 × 844</b></div>
        <div className="evidence-inspector">
          <div><small>viewportWidth</small><strong>390</strong><em>px</em></div>
          <div><small>documentWidth</small><strong>424</strong><em>px</em></div>
          <div><small>horizontalOverflow</small><strong>34</strong><em>px</em></div>
          <div><small>selector</small><strong>.pricing-grid</strong></div>
        </div>
        <div className="evidence-ruler"><span>{t.viewport}</span><i /><b>+34 px</b></div>
      </div>
    );
  }

  if (id === "explain") {
    return (
      <div className="landing-demo landing-demo-explain">
        <div className="explain-block">
          <small>{t.confirmedFact}</small>
          <strong>Document width is larger than the tested viewport.</strong>
          <span>{t.evidenceSource}</span>
        </div>
        <div className="explain-block explain-ai">
          <small>{t.aiContext}</small>
          <p>{t.aiCopy}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-demo landing-demo-retest">
      <div className="retest-column">
        <small>{t.retestBefore}</small>
        <strong>34 px</strong>
        <span>{t.retestOverflow}</span>
      </div>
      <div className="retest-center">
        <span>{t.retestFix}</span>
        <b>→</b>
        <small>{t.retestRun}</small>
      </div>
      <div className="retest-column retest-after">
        <small>{t.retestAfter}</small>
        <strong>0 px</strong>
        <span>{t.retestWithin}</span>
      </div>
    </div>
  );
}


function ProductProof({ t }: { t: Record<string, string> }) {
  const proofItems = [
    ["01", t.proofFind, t.proofFindCopy],
    ["02", t.proofUnderstand, t.proofUnderstandCopy],
    ["03", t.proofImprove, t.proofImproveCopy],
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
            <h2 dangerouslySetInnerHTML={{ __html: t.proofTitle }} />
            <p className="landing-proof-lead">{t.proofLead}</p>
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

function AudienceBlock({ t }: { t: Record<string, string> }) {
  return (
    <section className="landing-audience-section">
      <div className="landing-container">
        <div className="landing-audience-intro">
          <span className="landing-section-kicker">{t.audienceSection}</span>
          <h2 dangerouslySetInnerHTML={{ __html: t.audienceTitle }} />
          <p>{t.audienceSectionBody}</p>
        </div>
        <div className="landing-audience-grid">
          <article>
            <span>{t.audienceDevelopers.toUpperCase()}</span>
            <h3>{t.audienceDevelopersTitle}</h3>
            <p>{t.audienceDevelopersCopy}</p>
            <a href="#how-it-works">{t.audienceExplore} →</a>
          </article>
          <article>
            <span>{t.audienceOwners.toUpperCase()}</span>
            <h3>{t.audienceOwnersTitle}</h3>
            <p>{t.audienceOwnersCopy}</p>
            <a href="#evidence">{t.evidenceLink} →</a>
          </article>
          <article>
            <span>{t.audienceDesigners.toUpperCase()}</span>
            <h3>{t.audienceDesignersTitle}</h3>
            <p>{t.audienceDesignersCopy}</p>
            <a href="#product">{t.productLink} →</a>
          </article>
        </div>
      </div>
    </section>
  );
}

function FAQSection({ t }: { t: Record<string, string> }) {
  const items = [
    [t.faqCheck, t.faqCheckAnswer],
    [t.faqWho, t.faqWhoAnswer],
    [t.faqInstall, t.faqInstallAnswer],
    [t.faqAi, t.faqAiAnswer],
    [t.faqRetest, t.faqRetestAnswer],
    [t.faqFree, t.faqFreeAnswer],
  ];

  return (
    <section className="landing-faq-section" id="faq">
      <div className="landing-container landing-faq-grid">
        <div className="landing-faq-title">
          <span className="landing-section-kicker">{t.faqKicker}</span>
          <h2 dangerouslySetInnerHTML={{ __html: t.faqTitle }} />
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
  const [language, setLanguage] = useState<Language>(() => {
    const params = new URLSearchParams(window.location.search);
    const queryLanguage = params.get("lang")?.toUpperCase();
    if (queryLanguage === "EN" || queryLanguage === "TR") return queryLanguage;
    return window.localStorage.getItem("visibilio-language") === "TR" ? "TR" : "EN";
  });
  const t = translations[language];
  const featureSteps = localizeFeatureSteps(language);
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    document.documentElement.lang = language.toLowerCase();
    window.localStorage.setItem("visibilio-language", language);
    const params = new URLSearchParams(window.location.search);
    params.set("lang", language.toLowerCase());
    const query = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (query ? "?" + query : "") + window.location.hash);
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

  const openApp = (targetUrl?: string) => {
    if (targetUrl?.trim()) {
      window.sessionStorage.setItem("visibilio-pending-url", targetUrl.trim());
    }
    window.location.hash = "#app/analyze";
    setMenuOpen(false);
  };


  return (
    <div className="landing-page" id="top">
      <header className="landing-nav-wrap">
        <div className="landing-nav">
          <Brand />
          <nav id="landing-navigation" className={menuOpen ? "landing-nav-links is-open" : "landing-nav-links"} aria-label="Main navigation">
            {navLinks.map(([href, key]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>{t[key]}</a>
            ))}
            <a href="#retest" onClick={() => setMenuOpen(false)}>{t.retest}</a>
          </nav>
          <div className="landing-nav-actions">
          <div className="landing-language-switcher" aria-label="Language">
            <button type="button" className={language === "EN" ? "is-active" : ""} onClick={() => setLanguage("EN")}>EN</button>
            <span>/</span>
            <button type="button" className={language === "TR" ? "is-active" : ""} onClick={() => setLanguage("TR")}>TR</button>
          </div>
            <a className="landing-signin" href="#app/overview">{t.workspace}</a>
            <button className="landing-cta" type="button" onClick={() => openApp()}>{t.start}</button>
            <button className="landing-menu-button" type="button" aria-controls="landing-navigation" aria-expanded={menuOpen} aria-label={menuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMenuOpen((value) => !value)}><span /><span /></button>
          </div>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-container landing-hero-grid">
            <div className="landing-hero-copy">
              <span className="landing-eyebrow">{t.heroEyebrow}</span>
              <h1 dangerouslySetInnerHTML={{ __html: t.heroTitle }} />
              <p>{t.heroBody}</p>
              <div className="landing-hero-actions">
                <button className="landing-primary" type="button" onClick={() => openApp()}>{t.heroAnalyze} <span>↗</span></button>
                <a className="landing-secondary" href="#how-it-works">{t.seeHow} <span>↓</span></a>
              </div>
              <div className="landing-hero-note landing-audience-callout">
                <strong className="landing-audience-title">
                  <span>{t.audienceDevelopers.toLowerCase()}</span>
                  <i>·</i>
                  <span>{t.audienceDesigners.toLowerCase()}</span>
                  <i>·</i>
                  <span>{t.audienceOwners.toLowerCase()}</span>
                </strong>
                <span className="landing-audience-body">{t.audienceBody}</span>
              </div>
            </div>
            <div>
              <HeroEvidence t={t} />
              <div className="landing-proof-caption"><span>{t.whatYouGet}</span><strong>{t.proofCaption}</strong></div>
            </div>
          </div>
        </section>

        <section className="landing-share-section landing-url-section">
          <div className="landing-container landing-share-grid landing-share-dark">
            <div className="landing-url-copy">
              <span className="landing-section-kicker">{t.startWebsite}</span>
              <h2 dangerouslySetInnerHTML={{ __html: t.urlTitle }} />
              <p>{t.urlBody}</p>
              <div className="landing-url-audience">
                <span>{t.audienceDevelopers}</span>
                <span>{t.audienceDesigners}</span>
                <span>{t.audienceOwners}</span>
              </div>
            </div>
            <form className="landing-url-form" onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const data = new FormData(form);
              openApp(String(data.get("url") ?? ""));
            }}>
              <label htmlFor="landing-url">{t.urlLabel}</label>
              <div className="landing-url-field">
                <input id="landing-url" type="url" name="url" inputMode="url" autoComplete="url" placeholder="https://your-site.com/pricing" required />
                <button type="submit">{t.analyze} <span>↗</span></button>
              </div>
              <small>{t.urlNote}</small>
            </form>
          </div>
        </section>

        <section className="landing-intro-section" id="product">
          <div className="landing-container landing-two-col">
            <div className="landing-section-side">
              <span className="landing-eyebrow">{t.productEyebrow}</span>
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
              <span className="landing-section-kicker">{t.how}</span>
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
                    <StepVisual id={step.id} t={t} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ProductProof t={t} />
        <AudienceBlock t={t} />

        <section className="landing-evidence-section" id="evidence">
          <div className="landing-container landing-evidence-feature">
            <div className="landing-section-heading">
              <span className="landing-section-kicker">{t.evidenceEyebrow}</span>
              <span className="landing-display-label">03</span>
              <h2 dangerouslySetInnerHTML={{ __html: t.evidenceTitle }} />
              <p>{t.evidenceBody}</p>
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
              <span className="landing-section-kicker">{t.resultEyebrow}</span>
              <h2 dangerouslySetInnerHTML={{ __html: t.resultTitle }} />
              <p>{t.resultBody}</p>
              <button className="landing-primary" type="button" onClick={() => openApp()}>{t.heroAnalyze} <span>↗</span></button>
            </div>
            <div className="landing-retest-visual">
              <div className="result-before"><small>BEFORE</small><b>34 px</b><span>overflow</span></div>
              <div className="result-divider"><span>FIX</span><i>→</i></div>
              <div className="result-after"><small>AFTER</small><b>0 px</b><span>within viewport</span></div>
              <div className="result-foot">{t.retestFoot}</div>
            </div>
          </div>
        </section>

        <FAQSection t={t} />

        <section className="landing-final-section">
          <div className="landing-container landing-final-grid">
            <div>
              <span className="landing-section-kicker">{t.finalEyebrow}</span>
              <h2>{language === "TR" ? <>Bir sayfa verin.<br /><em>Daha net bir sonraki adım alın.</em></> : <>Give us a page.<br /><em>Get a clearer next step.</em></>}</h2>
              <p>{t.finalBodyCopy}</p>
            </div>
            <div className="landing-final-action"><button className="landing-primary landing-primary-light" type="button" onClick={() => openApp()}>{t.finalAction} <span>↗</span></button><small>{t.finalSetup}</small></div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-grid">
          <div><Brand/><p>Website UI quality, backed by evidence.</p></div>
          <div className="landing-footer-links">{navLinks.map(([href,key])=><a key={href} href={href}>{t[key]}</a>)}<a href="#retest">{t.retest}</a><a href="#app/overview">{t.workspace}</a></div>
          <small>Visibilio · 2026</small>
        </div>
      </footer>
    </div>
  );
}
