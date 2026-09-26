import { useEffect, useRef, useState } from "react";

const navLinks = [
  ["#product", "product"],
  ["#how-it-works", "how"],
  ["#evidence", "evidence"],
] as const;

type Language = "EN" | "TR";

const translations: Record<Language, Record<string, string>> = {
  EN: {
    product: "Product", how: "How it works", evidence: "Evidence", retest: "Re-test", workspace: "Open app", start: "Start for free", browserCheck: "REAL BROWSER CHECK", liveCheck: "LIVE CHECK", demoPageTitle: "Pricing", urlStep1: "Enter a page", urlStep2: "Inspect the browser", urlStep3: "Get the finding", outcomeChange: "MEASURED CHANGE", outcomeResolved: "RESOLVED", outcomeRule: "responsive.horizontal-overflow", heroAnalyze: "Analyze a page", seeHow: "See the workflow", 
    heroEyebrow: "Website UI quality, backed by evidence.", heroTitle: "Find the UI issues.<br /><em>Fix what users notice.</em>",
    heroBody: "Scan a real page, see measurable UI problems, understand the evidence, and verify the fix.", finding: "Finding", contentExceeds: "Content extends beyond viewport", mobile: "mobile", measuredBrowser: "Measured in a real browser.",
    audience: "Built for developers, designers, and website owners.", audienceBody: "One workflow to find, understand, fix, and re-test the UI issues that matter.",
    startWebsite: "Start with your website", urlTitle: "Give us the URL.<br /><em>We’ll show you where to look.</em>",
    urlBody: "One place to start. Paste a page, run the check, and get a finding you can act on.", urlLabel: "Website URL", analyze: "Analyze", urlNote: "Start free · the page stays attached to your audit.",
    productEyebrow: "Why Visibilio", productTitle: "“Something feels off.”<br /><span>Now you can see why.</span>",
    productBody: "A website can look wrong without telling you why. Visibilio starts with what actually happened in the browser—not a score, not a guess.",
    productBody2: "That turns a vague problem into a finding with context: what broke, where it happened, what was measured, and what to investigate next.", proofTitle: "From a<br />vague feeling<br /><em>to a useful answer.</em>", proofLead: "See the issue, understand the evidence, make the change, and verify what actually improved.", proofFind: "Find", proofFindCopy: "See measurable issues before they become another debugging session.", proofUnderstand: "Understand", proofUnderstandCopy: "Get the browser context, affected element, and evidence in one place.", proofImprove: "Improve", proofImproveCopy: "Make the change, re-run the same check, and see what actually moved.", audienceDevelopers:"Developers", audienceDevelopersTitle:"Find the bug faster.", audienceDevelopersCopy:"Get viewport measurements, selectors, rule details, and evidence you can reproduce.", audienceOwners:"Website owners", audienceOwnersTitle:"Know what deserves attention.", audienceOwnersCopy:"See the issue in plain language before you need to understand the implementation.", audienceDesigners:"Designers", audienceDesignersTitle:"See the context behind the page.", audienceDesignersCopy:"Connect visual observations to the tested viewport and the evidence underneath them.", audienceExplore:"Explore the workflow", evidenceLink:"See what we measure", productLink:"See how Visibilio thinks", whatYouGet:"01 / WHAT YOU GET", proofCaption:"A finding you can actually act on.", retestBefore:"BEFORE", retestAfter:"AFTER", retestOverflow:"overflow", retestWithin:"within viewport", retestFix:"FIX", retestRun:"RUN THE SAME CHECK", retestFoot:"Same rule · same viewport · measured again",
    audienceSection: "One product. Different reasons to use it.", audienceTitle: "Build it.<br /><em>Own it. Improve it.</em>", audienceSectionBody: "Visibilio gives each person behind a website the same useful starting point: a clear finding backed by evidence.",
    evidenceEyebrow: "Evidence first", demoSite: "your-site.com", demoMeasurement: "MEASUREMENT", demoMobile: "mobile", confirmedFact: "CONFIRMED FACT", aiContext: "AI CONTEXT", evidenceSource: "Evidence source · browser measurement", demoIssue: "Content extends beyond the viewport.", demoRule: "responsive.horizontal-overflow", aiCopy: "This can create horizontal scrolling on smaller screens. Check fixed-width children and grid sizing first.", viewport: "viewport", document: "document", selector: "selector", px: "px", evidenceTitle: "Know what was measured.<br /><em>Know what was suggested.</em>", evidenceBody: "Visibilio keeps browser evidence, deterministic findings, and AI context visibly separate—so a useful suggestion never gets mistaken for a measured fact.", resultBody: "A re-test gives you a concrete before-and-after result, so improvement is something you can inspect.", resultEyebrow: "The outcome", resultTitle: "See the fix.<br /><em>Then prove it stayed fixed.</em>", finalBodyCopy: "Made for developers, designers, and anyone responsible for a website.",
    retestEyebrow: "The outcome", retestTitle: "See the fix.<br /><em>Then prove it stayed fixed.</em>",
    faqKicker: "Questions, answered.", faqTitle: "Frequently asked<br /><em>questions</em>", faqCheck:"What does Visibilio check?", faqCheckAnswer:"Visibilio measures real browser behavior and attaches viewport, selector, and measurement evidence to each finding.", faqWho:"Who is Visibilio for?", faqWhoAnswer:"Developers, designers, and website owners who need a reproducible view of real UI issues.", faqInstall:"Do I need to install anything?", faqInstallAnswer:"No. Start with a URL and run the browser-based audit from the app.", faqAi:"What does AI do?", faqAiAnswer:"AI adds context and suggested next steps while measured browser evidence stays separate.", faqRetest:"Can I verify a fix?", faqRetestAnswer:"Yes. Re-run the same check and compare the before and after measurements.", faqFree:"Can I try it for free?", faqFreeAnswer:"Yes. The landing flow starts with a free scan workflow.",
    finalKicker: "Start free", finalTitle: "Give us a page.<br /><em>Get a clearer next step.</em>", finalBody: "Made for developers, designers, and anyone responsible for a website.", finalAction: "Start for free", finalSetup: "No setup tour required.", footerTagline: "Website UI quality, backed by evidence.", languageLabel: "Language", openNavigation: "Open navigation", closeNavigation: "Close navigation", foundLabel: "FOUND", observedLabel: "OBSERVED", interpretedLabel: "INTERPRETED", beforeLabel: "BEFORE", afterLabel: "AFTER", overflowLabel: "overflow", withinViewportLabel: "within viewport", aiNotMeasurement: "AI-generated context · not a measurement", observedCopy: "34 px horizontal overflow", observedMeta: "viewport: 390 × 844 · selector: .pricing-grid", interpretedCopy: "Check fixed-width children and grid sizing first.", observedFact: "Document width is larger than the tested viewport."
  },
  TR: {
    product: "Ürün", how: "Nasıl çalışır", evidence: "Kanıt", retest: "Tekrar test", workspace: "Uygulamayı aç", start: "Ücretsiz başla", browserCheck: "GERÇEK TARAYICI KONTROLÜ", liveCheck: "CANLI KONTROL", demoPageTitle: "Fiyatlandırma", urlStep1: "Bir sayfa girin", urlStep2: "Tarayıcıyı inceleyin", urlStep3: "Bulguyu alın", outcomeChange: "ÖLÇÜLEN DEĞİŞİM", outcomeResolved: "ÇÖZÜLDÜ", outcomeRule: "responsive.horizontal-overflow", heroAnalyze: "Sayfayı analiz et", seeHow: "Nasıl çalışır?",
    heroEyebrow: "Gerçek tarayıcı verileriyle web sitesi arayüz kalitesi.", heroTitle: "Arayüz sorununu bulun.<br /><em>Görünen problemi düzeltin.</em>",
    heroBody: "Gerçek bir sayfayı tarayın; ölçülebilir arayüz sorunlarını görün, kanıtı anlayın ve yaptığınız düzeltmeyi tekrar test edin.", finding: "Bulgu", contentExceeds: "İçerik görünüm alanını aşıyor", mobile: "mobil", measuredBrowser: "Gerçek tarayıcıda ölçüldü.",
    audience: "Geliştiriciler, tasarımcılar ve web sitenizden sorumlu herkes için.", audienceBody: "Önemli arayüz sorunlarını bulmak, anlamak, düzeltmek ve tekrar test etmek için tek akış.",
    startWebsite: "Sayfanızla başlayın", urlTitle: "URL'yi verin.<br /><em>Nereye bakacağınızı birlikte bulalım.</em>",
    urlBody: "Bir sayfa girin, kontrolü çalıştırın ve üzerinde harekete geçebileceğiniz net bir bulgu alın.", urlLabel: "Web sitesi URL'si", analyze: "Analiz et", urlNote: "Ücretsiz başlayın · sayfanız denetime bağlı kalır.",
    productEyebrow: "Neden Visibilio?", productTitle: "“Bir şeyler yanlış.”<br /><span>Artık nedenini görebilirsiniz.</span>",
    productBody: "Bir web sitesi nedenini söylemeden yanlış görünebilir. Visibilio puan veya tahmin yerine tarayıcıda gerçekten olanla başlar.",
    productBody2: "Böylece belirsiz bir sorun; neyin bozulduğu, nerede olduğu, neyin ölçüldüğü ve sırada neye bakılması gerektiği belli olan bir bulguya dönüşür.", proofTitle: "Belirsiz bir<br />sorundan<br /><em>net bir sonraki adıma.</em>", proofLead: "Sorunu görün, tarayıcı kanıtını inceleyin, neyi değiştireceğinizi anlayın ve aynı kontrolle sonucu doğrulayın.", proofFind: "Bul", proofFindCopy: "Sorun büyümeden önce ölçülebilir UI problemlerini görün.", proofUnderstand: "Anla", proofUnderstandCopy: "Tarayıcı bağlamını, etkilenen öğeyi ve ölçüm kanıtını tek yerde görün.", proofImprove: "Düzelt", proofImproveCopy: "Değişikliği yapın, aynı kontrolü tekrar çalıştırın ve gerçekten neyin düzeldiğini görün.", audienceDevelopers:"Geliştiriciler", audienceDevelopersTitle:"Hatanın kaynağını daha hızlı bulun.", audienceDevelopersCopy:"Viewport ölçümlerini, selector bilgilerini, kural ayrıntılarını ve yeniden üretebileceğiniz kanıtı görün.", audienceOwners:"Web sitesi sahipleri", audienceOwnersTitle:"Neyin öncelikli olduğunu bilin.", audienceOwnersCopy:"Uygulama ayrıntılarına girmeden önce sorunu anlaşılır biçimde görün.", audienceDesigners:"Tasarımcılar", audienceDesignersTitle:"Sayfanın arkasındaki bağlamı görün.", audienceDesignersCopy:"Görsel gözlemleri test edilen viewport ve altındaki kanıtla ilişkilendirin.", audienceExplore:"Akışı keşfedin", evidenceLink:"Neleri ölçtüğümüzü görün", productLink:"Visibilio yaklaşımını görün", whatYouGet:"01 / NE ALIRSINIZ", proofCaption:"Üzerinde gerçekten harekete geçebileceğiniz bir bulgu.", retestBefore:"ÖNCE", retestAfter:"SONRA", retestOverflow:"taşma", retestWithin:"viewport içinde", retestFix:"DÜZELT", retestRun:"AYNI KONTROLÜ TEKRAR ÇALIŞTIR", retestFoot:"Aynı kural · aynı viewport · yeniden ölçüldü",
    audienceSection: "Aynı ürün. Farklı sorumluluklar.", audienceTitle: "Sorunu bulun.<br /><em>Kanıtı görün. Sonucu doğrulayın.</em>", audienceSectionBody: "Visibilio, web sitesinden sorumlu herkes için aynı başlangıcı sunar: kanıtlarla desteklenen net bir bulgu.",
    evidenceEyebrow: "Önce kanıt", demoSite: "siteniz.com", demoMeasurement: "ÖLÇÜM", demoMobile: "mobil", confirmedFact: "ÖLÇÜLEN GERÇEK", aiContext: "AI BAĞLAMI", evidenceSource: "Kaynak · tarayıcı ölçümü", demoIssue: "İçerik görünüm alanını aşıyor.", demoRule: "responsive.horizontal-overflow", aiCopy: "Bu durum küçük ekranlarda yatay kaydırmaya yol açabilir. Önce sabit genişlikli öğeleri ve grid boyutlandırmasını kontrol edin.", viewport: "viewport", document: "belge", selector: "selector", px: "px", evidenceTitle: "Ne ölçüldüğünü bilin.<br /><em>Ne önerildiğini ayırın.</em>", evidenceBody: "Visibilio, tarayıcı kanıtını, ölçülebilir bulguları ve AI yorumunu açıkça ayırır; öneri ile ölçüm birbirine karışmaz.", resultBody: "Tekrar test, önceki ve sonraki ölçümü karşılaştırır; böylece değişikliğin gerçekten işe yarayıp yaramadığını görebilirsiniz.", resultEyebrow: "Sonuç", resultTitle: "Düzeltmeyi görün.<br /><em>Sonucun kaldığını doğrulayın.</em>", finalBodyCopy: "Geliştiriciler, tasarımcılar ve web sitenizden sorumlu herkes için.",
    retestEyebrow: "Sonuç", retestTitle: "Düzeltmeyi görün.<br /><em>Sonucun kaldığını doğrulayın.</em>",
    faqKicker: "Sorular ve yanıtlar", faqTitle: "Sık sorulan<br /><em>sorular</em>", faqCheck:"Visibilio neyi kontrol ediyor?", faqCheckAnswer:"Visibilio gerçek tarayıcı davranışını ölçer ve her bulguya viewport, selector ve ölçüm kanıtını ekler.", faqWho:"Visibilio kimler için?", faqWhoAnswer:"Gerçek arayüz sorunlarını yeniden üretebilir biçimde görmek isteyen geliştiriciler, tasarımcılar ve web sitesi sahipleri için.", faqInstall:"Bir şey yüklemem gerekiyor mu?", faqInstallAnswer:"Hayır. Bir URL girin ve tarayıcı tabanlı denetimi uygulama üzerinden çalıştırın.", faqAi:"AI ne yapıyor?", faqAiAnswer:"AI, ölçülen tarayıcı kanıtından ayrı kalarak bağlam ve sonraki adım önerileri ekler.", faqRetest:"Bir düzeltmeyi doğrulayabilir miyim?", faqRetestAnswer:"Evet. Aynı kontrolü yeniden çalıştırıp önceki ve sonraki ölçümleri karşılaştırabilirsiniz.", faqFree:"Ücretsiz deneyebilir miyim?", faqFreeAnswer:"Evet. Başlangıç akışı ücretsiz bir taramayla başlar.",
    finalKicker: "Ücretsiz başla", finalTitle: "Bir sayfa verin.<br /><em>Sorunun nerede olduğunu görelim.</em>", finalBody: "Geliştiriciler, tasarımcılar ve web sitenizden sorumlu herkes için.", finalAction: "Ücretsiz başla", finalSetup: "Kurulum turuna gerek yok.", footerTagline: "Kanıtla desteklenen web sitesi arayüz kalitesi.", languageLabel: "Dil", openNavigation: "Menüyü aç", closeNavigation: "Menüyü kapat", foundLabel: "BULUNDU", observedLabel: "GÖZLEMLENEN", interpretedLabel: "YORUMLANAN", beforeLabel: "ÖNCE", afterLabel: "SONRA", overflowLabel: "taşma", withinViewportLabel: "viewport içinde", aiNotMeasurement: "AI bağlamı · ölçüm değildir", observedCopy: "34 px yatay taşma", observedMeta: "viewport: 390 × 844 · selector: .pricing-grid", interpretedCopy: "Sabit genişlikli öğeleri ve grid boyutlandırmasını önce kontrol edin.", observedFact: "Belge genişliği test edilen viewport’tan daha büyük."
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
        <code>visibilio / audit / responsive</code>
        <b>{t.liveCheck}</b>
      </div>
      <div className="landing-window-grid">
        <div className="landing-site-frame">
          <div className="landing-site-head">
            <b>{t.demoSite}</b>
            <span>{t.mobile} · 390 × 844</span>
          </div>
          <div className="landing-site-body">
            <div className="landing-site-page-title">{t.demoPageTitle}</div>
            <i className="line line-a" />
            <i className="line line-b" />
            <div className="landing-site-cards"><i /><i /><i /></div>
            <div className="landing-overflow-callout"><b>34 {t.px}</b><span>{t.overflowLabel}</span></div>
          </div>
        </div>
        <aside className="landing-evidence-card">
          <div className="landing-evidence-status"><span /> {t.finding}</div>
          <strong>{t.contentExceeds}</strong>
          <b>34 <small>{t.px}</small></b>
          <div className="landing-evidence-grid">
            <div><span>{t.viewport}</span><strong>390 px</strong></div>
            <div><span>{t.document}</span><strong>424 px</strong></div>
            <div><span>{t.selector}</span><strong>.pricing-grid</strong></div>
          </div>
          <p><span>✓</span>{t.measuredBrowser}</p>
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
          <div className="demo-note-top"><small>{t.foundLabel}</small><span>{t.demoRule}</span></div>
          <strong>{t.demoIssue}</strong>
          <div className="demo-note-metric"><b>34 px</b><span>{t.overflowLabel}</span></div>
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
          <div><small>{t.selector}</small><strong>.pricing-grid</strong></div>
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
          <strong>{t.observedFact}</strong>
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
      <div className="retest-browser">
        <div className="retest-browser-head">
          <span>{t.demoSite}</span>
          <b>390 × 844</b>
        </div>
        <div className="retest-browser-stage">
          <div className="retest-page retest-page-before">
            <div className="retest-page-header" />
            <div className="retest-page-content">
              <i />
              <i />
              <div className="retest-card-row"><b /><b /><b /></div>
            </div>
            <div className="retest-overflow-edge">
              <span>+34 px</span>
            </div>
          </div>
          <div className="retest-page retest-page-after" aria-hidden="true">
            <div className="retest-page-header" />
            <div className="retest-page-content">
              <i />
              <i />
              <div className="retest-card-row"><b /><b /><b /></div>
            </div>
          </div>
          <div className="retest-scan-line" aria-hidden="true" />
          <div className="retest-state-badge">{t.retestBefore} → {t.retestAfter}</div>
        </div>
      </div>
      <div className="retest-result-panel">
        <div>
          <small>{t.retestBefore}</small>
          <strong>34 <span>px</span></strong>
          <em>{t.retestOverflow}</em>
        </div>
        <div className="retest-result-arrow" aria-hidden="true">→</div>
        <div className="is-resolved">
          <small>{t.retestAfter}</small>
          <strong>0 <span>px</span></strong>
          <em>{t.retestWithin}</em>
        </div>
      </div>
      <div className="retest-foot"><span>{t.retestFoot}</span><b>✓</b></div>
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
    <section className="landing-proof-section" aria-labelledby="proof-title">
      <div className="landing-container">
        <div className="landing-proof-heading">
          <div className="landing-proof-intro">
            <span className="landing-section-kicker">{t.productEyebrow}</span>
            <span className="landing-display-label">02</span>
          </div>
          <div>
            <h2 id="proof-title" dangerouslySetInnerHTML={{ __html: t.proofTitle }} />
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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth > 900) setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

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
    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const openApp = (targetUrl?: string) => {
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
          <Brand />
          <nav id="landing-navigation" className={menuOpen ? "landing-nav-links is-open" : "landing-nav-links"} aria-label="Main navigation">
            {navLinks.map(([href, key]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>{t[key]}</a>
            ))}
            <a href="#retest" onClick={() => setMenuOpen(false)}>{t.retest}</a>
          </nav>
          <div className="landing-nav-actions">
            <div className="landing-language-switcher" aria-label={t.languageLabel}>
              <button type="button" className={language === "EN" ? "is-active" : ""} onClick={() => setLanguage("EN")}>EN</button>
              <span>/</span>
              <button type="button" className={language === "TR" ? "is-active" : ""} onClick={() => setLanguage("TR")}>TR</button>
            </div>
            <a className="landing-signin" href="#app/overview">{t.workspace}</a>
            <button className="landing-cta" type="button" onClick={() => openApp()}>{t.start}</button>
            <button className="landing-menu-button" type="button" aria-controls="landing-navigation" aria-expanded={menuOpen} aria-label={menuOpen ? t.closeNavigation : t.openNavigation} onClick={() => setMenuOpen((value) => !value)}><span /><span /></button>
          </div>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-container landing-hero-grid">
            <div className="landing-hero-copy">
              <div className="landing-hero-label">
                <span className="landing-eyebrow">{t.heroEyebrow}</span>
                <span>{t.browserCheck}</span>
              </div>
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
              <div className="landing-url-audience" aria-label={t.audience}>
                <span>{t.audienceDevelopers}</span>
                <span>{t.audienceDesigners}</span>
                <span>{t.audienceOwners}</span>
              </div>
              <div className="landing-url-proof">
                <span>01</span>
                <strong>{t.urlStep1}</strong>
                <i>→</i>
                <span>02</span>
                <strong>{t.urlStep2}</strong>
                <i>→</i>
                <span>03</span>
                <strong>{t.urlStep3}</strong>
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
              <div className="landing-feature-nav" role="tablist" aria-label={language === "TR" ? "Özellik adımları" : "Feature steps"}>
                {featureSteps.map((step, index) => (
                  <button key={step.id} className={index === activeStep ? "is-active" : ""} type="button" role="tab" id={`landing-feature-tab-${step.id}`} aria-selected={index === activeStep} aria-controls={`landing-feature-step-${step.id}`} onClick={() => stepRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" })}>
                    <span>{step.index}</span><strong>{step.title}</strong>
                  </button>
                ))}
              </div>
            </div>
            <div className="landing-feature-scroll">
              {featureSteps.map((step, index) => (
                <div key={step.id} id={`landing-feature-step-${step.id}`} className="landing-feature-step" role="tabpanel" aria-labelledby={`landing-feature-tab-${step.id}`} data-step={index} ref={(node) => { stepRefs.current[index] = node; }}>
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
              <div><small>{t.observedLabel}</small><strong>{t.observedCopy}</strong><span>{t.observedMeta}</span></div>
              <div><small>{t.interpretedLabel}</small><strong>{t.interpretedCopy}</strong><span>{t.aiNotMeasurement}</span></div>
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
            <div className="landing-outcome-visual" aria-label={language === "TR" ? "Taşma sorununun önce ve sonra ölçümü" : "Before and after UI measurement"}>
              <div className="outcome-visual-head">
                <span>{t.outcomeChange}</span>
                <b>{t.outcomeRule}</b>
              </div>
              <div className="outcome-compare">
                <div className="outcome-state outcome-before">
                  <div className="outcome-state-label"><small>{t.beforeLabel}</small><span>390 × 844</span></div>
                  <div className="outcome-page">
                    <i className="outcome-page-line" />
                    <i className="outcome-page-line short" />
                    <div className="outcome-page-cards"><b /><b /><b /></div>
                    <div className="outcome-overflow-marker"><strong>+34 px</strong><span>{t.overflowLabel}</span></div>
                  </div>
                  <strong className="outcome-metric">34 <small>px</small></strong>
                </div>
                <div className="outcome-transition">
                  <span>{t.retestFix}</span>
                  <i aria-hidden="true">→</i>
                  <small>{t.retestRun}</small>
                </div>
                <div className="outcome-state outcome-after">
                  <div className="outcome-state-label"><small>{t.afterLabel}</small><span>390 × 844</span></div>
                  <div className="outcome-page">
                    <i className="outcome-page-line" />
                    <i className="outcome-page-line short" />
                    <div className="outcome-page-cards"><b /><b /><b /></div>
                    <div className="outcome-resolved-marker"><strong>✓</strong><span>{t.outcomeResolved}</span></div>
                  </div>
                  <strong className="outcome-metric">0 <small>px</small></strong>
                </div>
              </div>
              <div className="outcome-foot">
                <span>{t.retestFoot}</span>
                <strong>34 px → 0 px</strong>
              </div>
            </div>
          </div>
        </section>

        <FAQSection t={t} />

        <section className="landing-final-section">
          <div className="landing-container landing-final-grid">
            <div>
              <span className="landing-section-kicker">{t.finalKicker}</span>
              <h2 dangerouslySetInnerHTML={{ __html: t.finalTitle }} />
              <p>{t.finalBodyCopy}</p>
            </div>
            <div className="landing-final-action"><button className="landing-primary landing-primary-light" type="button" onClick={() => openApp()}>{t.finalAction} <span>↗</span></button><small>{t.finalSetup}</small></div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-grid">
          <div><Brand/><p>{t.footerTagline}</p></div>
          <div className="landing-footer-links">{navLinks.map(([href,key])=><a key={href} href={href}>{t[key]}</a>)}<a href="#retest">{t.retest}</a><a href="#app/overview">{t.workspace}</a></div>
          <small>Visibilio · 2026</small>
        </div>
      </footer>
    </div>
  );
}
