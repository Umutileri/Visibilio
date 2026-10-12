import { useEffect, useState } from "react";

const navLinks = [
  ["#v2-workflow", "how"],
  ["#product", "product"],
  ["#faq", "evidence"],
] as const;

type Language = "EN" | "TR";

const translations: Record<Language, Record<string, string>> = {
  EN: {
    product: "Product",
    how: "How it works",
    evidence: "Evidence",
    retest: "Re-test",
    workspace: "Open app",
    start: "Start for free",
    browserCheck: "REAL BROWSER CHECK",
    liveCheck: "LIVE CHECK",
    demoPageTitle: "Pricing",
    urlStep1: "Enter a page",
    urlStep2: "Inspect the browser",
    urlStep3: "Get the finding",
    outcomeChange: "MEASURED CHANGE",
    outcomeResolved: "RESOLVED",
    outcomeRule: "responsive.horizontal-overflow",
    navLabel: "Main navigation",
    heroAnalyze: "Analyze a page",
    seeHow: "See the workflow",
    viewportWidthLabel: "Viewport width",
    documentWidthLabel: "Document width",
    featureStepsLabel: "Feature steps",
    outcomeAria: "Before and after UI measurement",
    outcomeSummary:
      "Before: 34 pixels of horizontal overflow at 390 pixel viewport. After: 0 pixels of overflow after re-testing.",
    homeAria: "Visibilio home",
    heroEyebrow: "Website UI quality, backed by evidence.",
    heroTitle: "Find the UI issues.<br /><em>Know what to fix next.</em>",
    heroBody:
      "Run a browser-based UI check, inspect measurable findings, and re-test changes against the same rule.",
    finding: "Finding",
    contentExceeds: "Content extends beyond viewport",
    mobile: "mobile",
    measuredBrowser: "Measured in a real browser.",
    audience: "Built for developers, designers, and website owners.",
    audienceBody: "One workflow to find, understand, fix, and re-test the UI issues that matter.",
    startWebsite: "Start with your website",
    urlTitle: "Give us the URL.<br /><em>We’ll show you where to look.</em>",
    urlBody:
      "Enter a page in the app, review its measured findings, and open the evidence behind each result.",
    urlLabel: "Website URL",
    analyze: "Analyze",
    analyzing: "Opening the analyzer…",
    urlNote: "Early access · browser checks run in the local development environment.",
    productEyebrow: "Why Visibilio",
    productTitle: "Know what broke.<br /><span>See the evidence behind it.</span>",
    productBody:
      "A layout can fail at one viewport and look perfectly fine at another. Visibilio checks the page in a real browser and records the conditions around each issue.",
    productBody2:
      "You can inspect the affected element, the tested viewport, and the measurement itself—then decide what to change. AI suggestions stay separate from those measured results.",
    proofTitle: "From uncertainty<br /><em>to a clear next step.</em>",
    proofLead:
      "See the issue, understand the evidence, make the change, and verify what actually improved.",
    proofFind: "Find",
    proofFindCopy: "See measurable issues before they become another debugging session.",
    proofUnderstand: "Understand",
    proofUnderstandCopy: "Get the browser context, affected element, and evidence in one place.",
    proofImprove: "Fix",
    proofImproveCopy: "Make the change, re-run the same check, and verify the result.",
    audienceDevelopers: "Developers",
    audienceDevelopersTitle: "Find the bug faster.",
    audienceDevelopersCopy:
      "Get viewport measurements, selectors, rule details, and evidence you can reproduce.",
    audienceOwners: "Website owners",
    audienceOwnersTitle: "Know what deserves attention.",
    audienceOwnersCopy:
      "See the issue in plain language before you need to understand the implementation.",
    audienceDesigners: "Designers",
    audienceDesignersTitle: "See the context behind the page.",
    audienceDesignersCopy:
      "Connect visual observations to the tested viewport and the evidence underneath them.",
    audienceExplore: "Explore the workflow",
    audienceSectionLink: "See how a finding moves from detection to re-test",
    whatYouGet: "01 / WHAT YOU GET",
    proofCaption: "A finding you can actually act on.",
    retestBefore: "BEFORE",
    retestAfter: "AFTER",
    retestOverflow: "overflow",
    retestWithin: "within viewport",
    retestFix: "FIX",
    retestRun: "RUN THE SAME CHECK",
    retestFoot: "Same rule · same viewport · measured again",
    audienceSection: "Who it helps",
    audienceTitle: "One finding.<br /><em>Three useful ways in.</em>",
    audienceSectionBody:
      "The browser result stays the same. The useful detail changes with the job.",
    evidenceEyebrow: "Evidence first",
    demoSite: "your-site.com",
    demoMeasurement: "MEASUREMENT",
    demoMobile: "mobile",
    confirmedFact: "CONFIRMED FACT",
    aiContext: "AI CONTEXT",
    evidenceSource: "Evidence source · browser measurement",
    demoIssue: "Content extends beyond the viewport.",
    demoRule: "responsive.horizontal-overflow",
    aiCopy:
      "This can create horizontal scrolling on smaller screens. Check fixed-width children and grid sizing first.",
    viewport: "viewport",
    document: "document",
    selector: "selector",
    px: "px",
    evidenceTitle: "Facts on one side.<br /><em>Guidance on the other.</em>",
    evidenceBody:
      "Measured browser evidence stays distinct from interpretation, so a useful suggestion never gets mistaken for a measured fact.",
    resultBody:
      "Re-test the same check and see a concrete before-and-after result you can inspect.",
    resultEyebrow: "The outcome",
    resultTitle: "A fix is a start.<br /><em>Proof is the outcome.</em>",
    finalBodyCopy: "For developers, designers, and anyone responsible for a website.",
    retestEyebrow: "The outcome",
    retestTitle: "See the fix.<br /><em>Then prove it stayed fixed.</em>",
    faqKicker: "Questions, answered.",
    faqTitle: "Frequently asked<br /><em>questions</em>",
    faqCheck: "What does Visibilio check?",
    faqCheckAnswer:
      "Visibilio measures real browser behavior and attaches viewport, selector, and measurement evidence to each finding.",
    faqWho: "Who is Visibilio for?",
    faqWhoAnswer:
      "Developers, designers, and website owners who need a reproducible view of real UI issues.",
    faqInstall: "Do I need to install anything?",
    faqInstallAnswer:
      "The current build runs its scanner through the local app environment. Public hosted scans are not available yet.",
    faqAi: "What does AI do?",
    faqAiAnswer:
      "AI adds context and suggested next steps while measured browser evidence stays separate.",
    faqRetest: "Can I verify a fix?",
    faqRetestAnswer: "Yes. Re-run the same check and compare the before and after measurements.",
    faqFree: "Can I try it for free?",
    faqFreeAnswer:
      "The project is in early development. Access is currently for evaluation; paid plans and public scan availability are not live yet.",
    finalKicker: "Early access",
    finalTitle: "Make your next change<br /><em>with confidence.</em>",
    finalBody: "Made for developers, designers, and anyone responsible for a website.",
    finalAction: "Explore the product",
    finalSetup: "Early development · hosted scanning is not available yet.",
    footerTagline: "Website UI quality, backed by browser evidence.",
    languageLabel: "Language",
    openNavigation: "Open navigation",
    closeNavigation: "Close navigation",
    foundLabel: "FOUND",
    observedLabel: "OBSERVED",
    interpretedLabel: "INTERPRETED",
    beforeLabel: "BEFORE",
    afterLabel: "AFTER",
    overflowLabel: "overflow",
    withinViewportLabel: "within viewport",
    aiNotMeasurement: "AI-generated context · not a measurement",
    observedCopy: "34 px horizontal overflow",
    observedMeta: "viewport: 390 × 844 · selector: .pricing-grid",
    interpretedCopy: "Check fixed-width children and grid sizing first.",
    observedFact: "Document width is larger than the tested viewport.",
  },
  TR: {
    product: "Ürün",
    how: "Nasıl çalışır",
    evidence: "Kanıt",
    retest: "Tekrar test",
    workspace: "Uygulamayı aç",
    start: "Ücretsiz başla",
    browserCheck: "GERÇEK TARAYICI KONTROLÜ",
    liveCheck: "CANLI KONTROL",
    demoPageTitle: "Fiyatlandırma",
    urlStep1: "Bir sayfa girin",
    urlStep2: "Tarayıcıyı inceleyin",
    urlStep3: "Bulguyu alın",
    outcomeChange: "ÖLÇÜLEN DEĞİŞİM",
    outcomeResolved: "ÇÖZÜLDÜ",
    outcomeRule: "responsive.horizontal-overflow",
    navLabel: "Ana navigasyon",
    heroAnalyze: "Sayfayı analiz et",
    seeHow: "Nasıl çalışır?",
    viewportWidthLabel: "Ekran genişliği",
    documentWidthLabel: "Belge genişliği",
    featureStepsLabel: "Özellik adımları",
    outcomeAria: "Arayüz sorununun önce ve sonra ölçümü",
    outcomeSummary:
      "Önce: 390 piksel görünüm alanında 34 piksel yatay taşma. Sonra: tekrar testten sonra 0 piksel taşma.",
    homeAria: "Visibilio ana sayfa",
    heroEyebrow: "Gerçek tarayıcı kanıtlarıyla web sitesi arayüz kalitesi.",
    heroTitle: "Arayüz sorununu bulun.<br /><em>Sonraki düzeltmeyi netleştirin.</em>",
    heroBody:
      "Gerçek bir sayfayı tarayın; ölçülebilir arayüz sorunlarını görün, kanıtı anlayın ve yaptığınız düzeltmeyi tekrar test edin.",
    finding: "Bulgu",
    contentExceeds: "İçerik görünüm alanını aşıyor",
    mobile: "mobil",
    measuredBrowser: "Gerçek tarayıcıda ölçüldü.",
    audience: "Geliştiriciler, tasarımcılar ve web sitenizden sorumlu herkes için.",
    audienceBody:
      "Önemli arayüz sorunlarını bulmak, anlamak, düzeltmek ve tekrar test etmek için tek akış.",
    startWebsite: "Sayfanızla başlayın",
    urlTitle: "URL'yi verin.<br /><em>Nereye bakacağınızı birlikte bulalım.</em>",
    urlBody:
      "Uygulamada bir sayfa girin, ölçülen bulguları inceleyin ve her sonucun arkasındaki kanıtı açın.",
    urlLabel: "Web sitesi URL'si",
    analyze: "Analiz et",
    analyzing: "Analiz açılıyor…",
    urlNote: "Erken erişim · tarayıcı kontrolleri şu an yerel geliştirme ortamında çalışır.",
    productEyebrow: "Neden Visibilio?",
    productTitle: "“Bir şeyler yanlış.”<br /><span>Artık nedenini görebilirsiniz.</span>",
    productBody:
      "Bir web sitesi nedenini söylemeden yanlış görünebilir. Visibilio puan veya tahmin yerine tarayıcıda gerçekten olanla başlar.",
    productBody2:
      "Böylece belirsiz bir sorun; neyin bozulduğu, nerede olduğu, neyin ölçüldüğü ve sırada neye bakılması gerektiği belli olan bir bulguya dönüşür.",
    proofTitle: "Belirsizlikten<br /><em>net bir sonraki adıma.</em>",
    proofLead:
      "Sorunu görün, tarayıcı kanıtını inceleyin, neyi değiştireceğinizi anlayın ve aynı kontrolle sonucu doğrulayın.",
    proofFind: "Bul",
    proofFindCopy: "Sorun büyümeden önce ölçülebilir UI problemlerini görün.",
    proofUnderstand: "Anla",
    proofUnderstandCopy: "Tarayıcı bağlamını, etkilenen öğeyi ve ölçüm kanıtını tek yerde görün.",
    proofImprove: "Düzelt",
    proofImproveCopy:
      "Değişikliği yapın, aynı kontrolü tekrar çalıştırın ve sonucun gerçekten düzeldiğini doğrulayın.",
    audienceDevelopers: "Geliştiriciler",
    audienceDevelopersTitle: "Hatanın kaynağını daha hızlı bulun.",
    audienceDevelopersCopy:
      "Viewport ölçümlerini, selector bilgilerini, kural ayrıntılarını ve yeniden üretebileceğiniz kanıtı görün.",
    audienceOwners: "Web sitesi sahipleri",
    audienceOwnersTitle: "Neyin öncelikli olduğunu bilin.",
    audienceOwnersCopy: "Uygulama ayrıntılarına girmeden önce sorunu anlaşılır biçimde görün.",
    audienceDesigners: "Tasarımcılar",
    audienceDesignersTitle: "Sayfanın arkasındaki bağlamı görün.",
    audienceDesignersCopy:
      "Görsel gözlemleri test edilen viewport ve altındaki kanıtla ilişkilendirin.",
    audienceExplore: "İş akışını inceleyin",
    audienceSectionLink: "Bir bulgunun tespitten tekrar teste nasıl ilerlediğini görün",
    whatYouGet: "01 / NE ALIRSINIZ",
    proofCaption: "Üzerinde gerçekten harekete geçebileceğiniz bir bulgu.",
    retestBefore: "ÖNCE",
    retestAfter: "SONRA",
    retestOverflow: "taşma",
    retestWithin: "viewport içinde",
    retestFix: "DÜZELT",
    retestRun: "AYNI KONTROLÜ TEKRAR ÇALIŞTIR",
    retestFoot: "Aynı kural · aynı viewport · yeniden ölçüldü",
    audienceSection: "Kimler için?",
    audienceTitle: "Tek bulgu.<br /><em>Üç farklı bakış.</em>",
    audienceSectionBody:
      "Tarayıcı ölçümü değişmez. İşinize yarayan ayrıntı, rolünüze göre değişir.",
    evidenceEyebrow: "Önce kanıt",
    demoSite: "siteniz.com",
    demoMeasurement: "ÖLÇÜM",
    demoMobile: "mobil",
    confirmedFact: "ÖLÇÜLEN GERÇEK",
    aiContext: "AI BAĞLAMI",
    evidenceSource: "Kaynak · tarayıcı ölçümü",
    demoIssue: "İçerik görünüm alanını aşıyor.",
    demoRule: "responsive.horizontal-overflow",
    aiCopy:
      "Bu durum küçük ekranlarda yatay kaydırmaya yol açabilir. Önce sabit genişlikli öğeleri ve grid boyutlandırmasını kontrol edin.",
    viewport: "viewport",
    document: "belge",
    selector: "selector",
    px: "px",
    evidenceTitle: "Bir tarafta gerçekler.<br /><em>Diğer tarafta yön.</em>",
    evidenceBody:
      "Visibilio, tarayıcı kanıtını ve yorumlamayı ayırır; öneri ile ölçüm birbirine karışmaz.",
    resultBody:
      "Aynı kontrolü tekrar çalıştırın ve değişikliğin gerçekten işe yarayıp yaramadığını önce/sonra ölçümüyle görün.",
    resultEyebrow: "Sonuç",
    resultTitle: "Düzeltme başlangıçtır.<br /><em>Asıl sonuç doğrulamadır.</em>",
    finalBodyCopy: "Geliştiriciler, tasarımcılar ve web sitesinden sorumlu herkes için.",
    retestEyebrow: "Sonuç",
    retestTitle: "Düzeltmeyi görün.<br /><em>Sonucun kaldığını doğrulayın.</em>",
    faqKicker: "Sorular ve yanıtlar",
    faqTitle: "Sık sorulan<br /><em>sorular</em>",
    faqCheck: "Visibilio neyi kontrol ediyor?",
    faqCheckAnswer:
      "Visibilio gerçek tarayıcı davranışını ölçer ve her bulguya viewport, selector ve ölçüm kanıtını ekler.",
    faqWho: "Visibilio kimler için?",
    faqWhoAnswer:
      "Gerçek arayüz sorunlarını yeniden üretebilir biçimde görmek isteyen geliştiriciler, tasarımcılar ve web sitesi sahipleri için.",
    faqInstall: "Bir şey yüklemem gerekiyor mu?",
    faqInstallAnswer:
      "Mevcut sürüm tarayıcı motorunu yerel uygulama ortamında çalıştırır. Herkese açık barındırılan taramalar henüz kullanıma açık değil.",
    faqAi: "AI ne yapıyor?",
    faqAiAnswer:
      "AI, ölçülen tarayıcı kanıtından ayrı kalarak bağlam ve sonraki adım önerileri ekler.",
    faqRetest: "Bir düzeltmeyi doğrulayabilir miyim?",
    faqRetestAnswer:
      "Evet. Aynı kontrolü yeniden çalıştırıp önceki ve sonraki ölçümleri karşılaştırabilirsiniz.",
    faqFree: "Ücretsiz deneyebilir miyim?",
    faqFreeAnswer:
      "Proje erken geliştirme aşamasındadır. Ücretli paketler ve herkese açık tarama hizmeti henüz kullanıma açılmadı.",
    finalKicker: "Erken erişim",
    finalTitle: "Sonraki değişikliğinizi<br /><em>kanıta dayandırın.</em>",
    finalBody: "Geliştiriciler, tasarımcılar ve web sitenizden sorumlu herkes için.",
    finalAction: "Ürünü keşfet",
    finalSetup: "Erken geliştirme · barındırılan tarama henüz kullanıma açık değil.",
    footerTagline: "Tarayıcı kanıtlarıyla web sitesi arayüz kalitesi.",
    languageLabel: "Dil",
    openNavigation: "Menüyü aç",
    closeNavigation: "Menüyü kapat",
    foundLabel: "BULUNDU",
    observedLabel: "GÖZLEMLENEN",
    interpretedLabel: "YORUMLANAN",
    beforeLabel: "ÖNCE",
    afterLabel: "SONRA",
    overflowLabel: "taşma",
    withinViewportLabel: "viewport içinde",
    aiNotMeasurement: "AI bağlamı · ölçüm değildir",
    observedCopy: "34 px yatay taşma",
    observedMeta: "viewport: 390 × 844 · selector: .pricing-grid",
    interpretedCopy: "Sabit genişlikli öğeleri ve grid boyutlandırmasını önce kontrol edin.",
    observedFact: "Belge genişliği test edilen viewport’tan daha büyük.",
  },
};

function Brand({ label }: { label: string }) {
  return (
    <a className="landing-brand" href="#top" aria-label={label}>
      <img src="/Visibilio/visibilio-icon.svg" alt="" aria-hidden="true" />
      <span>Visibilio</span>
    </a>
  );
}

function FAQSection({ t, language }: { t: Record<string, string>; language: Language }) {
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
          <h2 className="landing-faq-heading" dangerouslySetInnerHTML={{ __html: t.faqTitle }} />
        </div>
        <div className="landing-faq-list">
          {items.map(([question, answer], index) => (
            <details key={question} className={index === 0 ? "is-featured" : ""} open={index === 0}>
              <summary>
                <span className="faq-question">{question}</span>
                <span className="faq-toggle" aria-hidden="true"><i /></span>
              </summary>
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
  const [isOpeningAnalyzer, setIsOpeningAnalyzer] = useState(false);

  useEffect(() => {
    document.documentElement.lang = language.toLowerCase();
    window.localStorage.setItem("visibilio-language", language);
    const params = new URLSearchParams(window.location.search);
    params.set("lang", language.toLowerCase());
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (query ? "?" + query : "") + window.location.hash,
    );
  }, [language]);

  const openApp = (targetUrl?: string) => {
    setIsOpeningAnalyzer(true);
    if (targetUrl?.trim()) {
      window.sessionStorage.setItem("visibilio-pending-url", targetUrl.trim());
    }
    window.location.hash = "#app/overview";
    setMenuOpen(false);
  };

  return (
    <div className="landing-page" id="top">
      <header className="landing-nav-wrap">
        <div className="landing-nav">
          <Brand label={t.homeAria} />
          <nav
            id="landing-navigation"
            className={menuOpen ? "landing-nav-links is-open" : "landing-nav-links"}
            aria-label={t.navLabel}
          >
            {navLinks.map(([href, key]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>
                {t[key]}
              </a>
            ))}
            <a href="#retest" onClick={() => setMenuOpen(false)}>
              {t.retest}
            </a>
          </nav>
          <div className="landing-nav-actions">
            <div className="landing-language-switcher" role="group" aria-label={t.languageLabel}>
              <button
                type="button"
                className={language === "EN" ? "is-active" : ""}
                onClick={() => setLanguage("EN")}
              >
                EN
              </button>
              <span>/</span>
              <button
                type="button"
                className={language === "TR" ? "is-active" : ""}
                onClick={() => setLanguage("TR")}
              >
                TR
              </button>
            </div>
            <a className="landing-signin" href="#app/overview">
              {t.workspace}
            </a>
            <button
              className="landing-cta"
              type="button"
              onClick={() => openApp()}
              disabled={isOpeningAnalyzer}
            >
              {isOpeningAnalyzer ? t.analyzing : t.start}
            </button>
            <button
              className="landing-menu-button"
              type="button"
              aria-controls="landing-navigation"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? t.closeNavigation : t.openNavigation}
              onClick={() => setMenuOpen((value) => !value)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="v2-hero" aria-labelledby="v2-hero-title">
          <div className="v2-container v2-hero-grid">
            <div className="v2-hero-copy">
              <div className="v2-eyebrow"><span className="v2-pulse" /> {t.heroEyebrow}</div>
              <h1 id="v2-hero-title">Your UI has blind spots.<br /><em>Visibilio finds them.</em></h1>
              <p>{t.heroBody}</p>
              <div className="v2-hero-actions">
                <button className="v2-button v2-button-primary" type="button" onClick={() => openApp()}>
                  {t.heroAnalyze} <span aria-hidden="true">↗</span>
                </button>
                <a className="v2-text-link" href="#v2-workflow">{t.seeHow} <span aria-hidden="true">↓</span></a>
              </div>
              <div className="v2-hero-meta"><span>Browser-based checks</span><i /> <span>Evidence-linked findings</span><i /> <span>Re-test your fixes</span></div>
            </div>
            <div className="v2-product-stage">
              <div className="v2-stage-glow" />
              <div className="v2-browser">
                <div className="v2-browser-bar">
                  <div className="v2-browser-dots"><i /><i /><i /></div>
                  <div className="v2-browser-address"><span>⌕</span> preview.yourwebsite.com</div>
                  <span className="v2-browser-state"><b /> SCAN COMPLETE</span>
                </div>
                <div className="v2-browser-content">
                  <div className="v2-site-preview">
                    <div className="v2-preview-nav"><b>northstar.</b><span>Product&nbsp;&nbsp; Resources&nbsp;&nbsp; Pricing</span><button>Get started</button></div>
                    <div className="v2-preview-hero"><small>BUILT FOR WHAT'S NEXT</small><strong>Make room<br />for better work.</strong><p>Everything your team needs to move with clarity.</p><span className="v2-preview-cta">Explore the platform ↗</span></div>
                    <div className="v2-preview-cards"><i /><i /><i /></div>
                    <div className="v2-issue-pin v2-pin-one"><b>01</b><span>Heading overflow</span></div>
                    <div className="v2-issue-pin v2-pin-two"><b>02</b><span>Low contrast</span></div>
                  </div>
                  <aside className="v2-findings-panel">
                    <div className="v2-panel-top"><span>SCAN FINDINGS</span><b>3 ISSUES</b></div>
                    <div className="v2-health"><div><small>UI HEALTH</small><strong>Needs attention</strong></div><span>!</span></div>
                    <div className="v2-finding-row is-critical"><i>!</i><div><b>Horizontal overflow</b><small>390px · .hero-content</small></div><span>High</span></div>
                    <div className="v2-finding-row"><i>◐</i><div><b>Text contrast</b><small>Button · 2.8:1 ratio</small></div><span>Med</span></div>
                    <div className="v2-finding-row"><i>↔</i><div><b>Inconsistent spacing</b><small>Card grid · 24 / 32px</small></div><span>Low</span></div>
                    <div className="v2-panel-foot"><span><b /> Evidence attached</span><span>View report ↗</span></div>
                  </aside>
                </div>
              </div>
              <div className="v2-floating-note"><span className="v2-note-icon">✳</span><div><b>Found in seconds</b><small>One issue ready to inspect</small></div><span className="v2-note-arrow">↗</span></div>
              <div className="v2-stage-caption"><span>01 / LIVE PRODUCT PREVIEW</span><span>VISIBILIO ANALYSIS ENGINE</span></div>
            </div>
          </div>
        </section>

        <section className="v2-proof-strip" aria-label="Product capabilities">
          <div className="v2-container v2-proof-inner"><span>MADE FOR THE DETAILS THAT BREAK EXPERIENCES</span><div><b>Responsive</b><i /> <b>Visual quality</b><i /> <b>Accessibility</b><i /> <b>Browser evidence</b></div></div>
        </section>

        <section className="v2-workflow" id="v2-workflow">
          <div className="v2-container">
            <div className="v2-section-heading"><span className="v2-kicker">THE WORKFLOW</span><h2>From “something feels off”<br /><em>to knowing what to fix.</em></h2><p>Less guesswork. Clear findings, useful context, and a way to verify the change.</p></div>
            <div className="v2-workflow-grid">
              <article className="v2-workflow-card v2-card-large"><span className="v2-card-index">01 / DETECT</span><div className="v2-card-visual v2-detect-visual"><div className="v2-viewport-frame"><div className="v2-viewport-top" /><div className="v2-viewport-lines"><i /><i /><i /></div><div className="v2-viewport-blocks"><b /><b /><b /></div><span className="v2-measure-line" /><span className="v2-measure-tag">+34px overflow</span></div></div><h3>Catch what breaks<br />across screen sizes.</h3><p>Inspect real browser layouts and surface issues that only appear at specific viewports.</p></article>
              <article className="v2-workflow-card"><span className="v2-card-index">02 / UNDERSTAND</span><div className="v2-card-visual v2-understand-visual"><div className="v2-code-window"><div><i /><i /><i /></div><code><b>.hero-content</b> {'{'}<br />&nbsp;&nbsp;max-width: <em>980px</em>;<br />&nbsp;&nbsp;overflow: <strong>visible</strong>;<br />{' }'}</code><span>Selector identified</span></div></div><h3>Know where<br />to look next.</h3><p>Connect every finding to its viewport, affected element, and supporting evidence.</p></article>
              <article className="v2-workflow-card"><span className="v2-card-index">03 / VERIFY</span><div className="v2-card-visual v2-verify-visual"><div className="v2-verify-check"><span>✓</span><div><b>Re-test passed</b><small>Horizontal overflow</small></div><strong>0px</strong></div><div className="v2-verify-bars"><i /><b /></div></div><h3>Make the fix.<br />Prove the result.</h3><p>Run the same check again and compare what changed instead of relying on a hunch.</p></article>
            </div>
          </div>
        </section>

        <section className="v2-url-section" id="product">
          <div className="v2-container v2-url-layout">
            <div><span className="v2-kicker">START WITH A URL</span><h2>Bring your website.<br /><em>We'll bring the clarity.</em></h2><p>Open the analyzer and inspect a page with browser-based checks. Public hosted scans are still in development.</p></div>
            <form className="v2-url-form" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); openApp(String(data.get("url") ?? "")); }}>
              <label htmlFor="v2-url-input">WEBSITE URL</label>
              <div><span>↗</span><input id="v2-url-input" type="url" name="url" placeholder="https://yourwebsite.com" required /><button type="submit" disabled={isOpeningAnalyzer}>{isOpeningAnalyzer ? t.analyzing : "Inspect page"} <b>↗</b></button></div>
              <small>Early access · No installation required for the current local workflow</small>
            </form>
          </div>
        </section>

        <section className="v2-audience-section">
          <div className="v2-container v2-audience-layout">
            <div><span className="v2-kicker">WHO IT'S FOR</span><h2>Built for people<br />who care how the web <em>works.</em></h2></div>
            <div className="v2-audience-list">
              <article><span>01</span><div><h3>Frontend developers</h3><p>Find reproducible UI bugs with the context you need to debug faster.</p></div><b>↗</b></article>
              <article><span>02</span><div><h3>Designers & freelancers</h3><p>Review responsive behavior and visual details before handing work over.</p></div><b>↗</b></article>
              <article><span>03</span><div><h3>Agencies & website teams</h3><p>Turn website reviews into clearer, evidence-backed conversations.</p></div><b>↗</b></article>
            </div>
          </div>
        </section>

        <FAQSection t={t} language={language} />

        <section className="landing-final-section landing-final-feature" id="final-cta">
          <div className="landing-container landing-final-simple">
            <span className="landing-final-eyebrow">{t.finalKicker}</span>
            <h2>{language === "TR" ? <>Sorunu görün.<br /><em>Sonraki adımı atın.</em></> : <>See what needs fixing.<br /><em>Know what to do next.</em></>}</h2>
            <p>{t.finalBodyCopy}</p>
            <button className="landing-final-main-action" type="button" onClick={() => openApp()} disabled={isOpeningAnalyzer}>
              {isOpeningAnalyzer ? t.analyzing : t.finalAction}
              <span aria-hidden="true">↗</span>
            </button>
            <small className="landing-final-note">{t.finalSetup}</small>
          </div>
        </section>
      </main>

      <footer className="landing-footer landing-footer-refined">
        <div className="landing-container landing-footer-grid">
          <div className="landing-footer-brand">
            <Brand label={t.homeAria} />
            <p>{t.footerTagline}</p>
          </div>
          <nav className="landing-footer-links" aria-label={language === "TR" ? "Alt menü" : "Footer navigation"}>
            <a href="#v2-workflow">{t.how}</a>
            <a href="#product">{t.product}</a>
            <a href="#faq">{language === "TR" ? "SSS" : "FAQ"}</a>
            <a href="#app/overview">{t.workspace}</a>
          </nav>
          <div className="landing-footer-meta">
            <span>© 2026 Visibilio</span>
            <a href="#top" aria-label={language === "TR" ? "Başa dön" : "Back to top"}>↑</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
