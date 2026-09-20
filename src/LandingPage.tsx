import { useEffect, useRef, useState } from "react";

const navigation = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#evidence", label: "Evidence" },
  { href: "#retest", label: "Re-test" },
];

const featureSlides = [
  { id:"detect", kicker:"01 / DETECT", title:"Find the thing that breaks.", copy:"Visibilio measures real browser state instead of asking AI to guess what might be wrong.", label:"Deterministic checks" },
  { id:"evidence", kicker:"02 / EVIDENCE", title:"See the measurement behind it.", copy:"Every finding is tied to a viewport, selector, and concrete browser evidence you can inspect.", label:"Measured evidence" },
  { id:"explain", kicker:"03 / EXPLAIN", title:"Understand why it matters.", copy:"AI sits after detection: it explains the confirmed issue and separates interpretation from fact.", label:"AI explanation" },
  { id:"retest", kicker:"04 / RE-TEST", title:"Ship the fix. Prove the change.", copy:"Run the same check again and compare the measured result instead of trusting a feeling.", label:"Before / after" },
];

function Logo() {
  return <a className="landing-brand" href="#top" aria-label="Visibilio home"><img src="/Visibilio/visibilio-icon.svg" alt="" aria-hidden="true" /><span>Visibilio</span></a>;
}

function EvidenceGraphic() {
  return <div className="landing-evidence-window" aria-label="Illustration of measured website evidence">
    <div className="landing-window-bar"><span/><span/><span/><code>visibilio / finding / responsive.horizontal-overflow</code></div>
    <div className="landing-window-body">
      <div className="landing-browser"><div className="landing-browser-header"><strong>Example site</strong><span>390 × 844</span></div>
        <div className="landing-browser-page"><div className="landing-page-title"/><div className="landing-page-copy"/>
          <div className="landing-page-grid"><i/><i/><i/></div><div className="landing-overflow-marker">+34 px</div>
        </div>
      </div>
      <div className="landing-evidence-panel"><span className="landing-mono">MEASUREMENT</span><strong>horizontalOverflow</strong><b>34 px</b>
        <dl><div><dt>viewport</dt><dd>390 px</dd></div><div><dt>document</dt><dd>424 px</dd></div><div><dt>selector</dt><dd>.pricing-grid</dd></div></dl>
        <small>Evidence first. Explanation second.</small>
      </div>
    </div>
  </div>;
}

function FeatureIllustration({ index }: { index: number }) {
  const slide = featureSlides[index];
  return <div className={"landing-feature-art landing-feature-art-" + slide.id}>
    <div className="landing-feature-chrome"><span>Visibilio / {slide.label}</span><span>live evidence</span></div>
    {slide.id === "detect" && <div className="landing-detect-art"><div className="landing-art-browser"><div/><div/><div/><div className="is-overflowing"/></div><div className="landing-art-callout"><span>Found</span><strong>34 px outside viewport</strong><small>.pricing-grid · mobile · 390 × 844</small></div></div>}
    {slide.id === "evidence" && <div className="landing-evidence-art"><div className="landing-measure-grid"><div><span>viewportWidth</span><strong>390</strong></div><div><span>documentWidth</span><strong>424</strong></div><div><span>overflow</span><strong>34 px</strong></div><div><span>selector</span><strong>.pricing-grid</strong></div></div><div className="landing-ruler"><i style={{left:"20%"}}/><i style={{left:"68%"}}/><span>390 px viewport</span></div></div>}
    {slide.id === "explain" && <div className="landing-explain-art"><div className="landing-explain-fact"><span>confirmed finding</span><strong>Document width exceeds viewport.</strong></div><div className="landing-explain-ai"><span>AI explanation</span><p>This can make the page horizontally scroll on smaller screens. Check fixed-width children and grid sizing first.</p></div></div>}
    {slide.id === "retest" && <div className="landing-retest-art"><div><span>BEFORE</span><strong>+34 px</strong><small>overflow</small></div><div className="landing-retest-arrow">→</div><div><span>AFTER</span><strong>0 px</strong><small>within viewport</small></div></div>}
  </div>;
}

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const featureRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if (!visible) return;
      const index = Number((visible.target as HTMLElement).dataset.index);
      if (!Number.isNaN(index)) setActiveFeature(index);
    }, { threshold:[0.35,0.6,0.8], rootMargin:"-12% 0px -18% 0px" });
    featureRefs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);

  function goToApp() { window.location.hash = "#app/analyze"; setMenuOpen(false); }

  return <div className="landing-page" id="top">
    <header className="landing-nav-wrap"><div className="landing-nav">
      <Logo/>
      <nav className={menuOpen ? "landing-nav-links is-open" : "landing-nav-links"} aria-label="Main navigation">
        {navigation.map(item => <a key={item.href} href={item.href} onClick={()=>setMenuOpen(false)}>{item.label}</a>)}
        <button className="landing-mobile-cta" type="button" onClick={goToApp}>Try Visibilio</button>
      </nav>
      <div className="landing-nav-actions">
        <a className="landing-signin" href="#app/overview">Sign in</a>
        <button className="landing-cta" type="button" onClick={goToApp}>Try it free</button>
        <button className="landing-menu-button" type="button" aria-expanded={menuOpen} aria-label="Toggle navigation" onClick={()=>setMenuOpen(open=>!open)}><span/><span/></button>
      </div>
    </div></header>

    <main>
      <section className="landing-hero"><div className="landing-container landing-hero-grid">
        <div className="landing-hero-copy"><span className="landing-eyebrow">Website UI quality, backed by evidence.</span>
          <h1>See what’s wrong.<br/><em>Fix what matters.</em></h1>
          <p>Visibilio turns browser measurements into issues you can understand, inspect, and re-test.</p>
          <div className="landing-hero-actions"><button className="landing-primary" type="button" onClick={goToApp}>Analyze a website <span>↗</span></button><a className="landing-secondary" href="#how-it-works">See how it works <span>↓</span></a></div>
          <div className="landing-proof-row"><span><i/> Browser measured</span><span><i/> Deterministic rules</span><span><i/> Re-testable</span></div>
        </div>
        <div className="landing-hero-proof"><EvidenceGraphic/><div className="landing-proof-caption"><span>01 / A REAL FINDING</span><strong>Not a score. A fact you can investigate.</strong></div></div>
      </div><div className="landing-hero-gridline" aria-hidden="true"/></section>

      <section className="landing-marquee" aria-label="Product principles"><div className="landing-marquee-track">
        <span>MEASURE</span><i>•</i><span>DETECT</span><i>•</i><span>SHOW EVIDENCE</span><i>•</i><span>EXPLAIN</span><i>•</i><span>FIX</span><i>•</i><span>RE-TEST</span><i>•</i>
        <span>MEASURE</span><i>•</i><span>DETECT</span><i>•</i><span>SHOW EVIDENCE</span><i>•</i><span>EXPLAIN</span><i>•</i><span>FIX</span><i>•</i><span>RE-TEST</span>
      </div></section>

      <section className="landing-intro-section" id="product"><div className="landing-container landing-two-col">
        <div><span className="landing-eyebrow">The problem</span><h2>“Something feels off.”<br/><span>That’s not enough.</span></h2></div>
        <div className="landing-prose"><p>Audit tools often collapse a complex website into a score. Visibilio starts somewhere more useful: what actually happened in the browser?</p><p>That means the product can tell you <strong>what broke</strong>, <strong>where</strong>, and <strong>what was measured</strong>—before AI ever enters the picture.</p></div>
      </div></section>

      <section className="landing-feature-section" id="how-it-works"><div className="landing-container landing-feature-layout">
        <div className="landing-feature-sticky"><span className="landing-eyebrow">How it works</span><div className="landing-feature-title"><span>{String(activeFeature+1).padStart(2,"0")} / {featureSlides.length}</span><h2>{featureSlides[activeFeature].title}</h2><p>{featureSlides[activeFeature].copy}</p></div>
          <div className="landing-feature-nav" role="tablist" aria-label="Feature steps">{featureSlides.map((slide,index)=><button key={slide.id} type="button" className={index===activeFeature?"is-active":""} onClick={()=>featureRefs.current[index]?.scrollIntoView({behavior:"smooth",block:"center"})}><span>{slide.kicker}</span><strong>{slide.label}</strong></button>)}</div>
        </div>
        <div className="landing-feature-scroll">{featureSlides.map((slide,index)=><div className="landing-feature-step" key={slide.id} data-index={index} ref={node=>{featureRefs.current[index]=node;}}><FeatureIllustration index={index}/></div>)}</div>
      </div></section>

      <section className="landing-evidence-section" id="evidence"><div className="landing-container">
        <div className="landing-section-heading"><span className="landing-eyebrow">Evidence first</span><h2>AI can explain a fact.<br/><em>It shouldn’t invent one.</em></h2></div>
        <div className="landing-evidence-band"><div className="landing-evidence-column"><span className="landing-mono">THE BROWSER</span><strong>390 × 844</strong><p>Controlled viewport</p></div><div className="landing-evidence-connector">→</div><div className="landing-evidence-column"><span className="landing-mono">THE RULE</span><strong>+34 px</strong><p>Horizontal overflow</p></div><div className="landing-evidence-connector">→</div><div className="landing-evidence-column"><span className="landing-mono">THE EXPLANATION</span><strong>Why it matters</strong><p>Clearly labeled AI context</p></div><div className="landing-evidence-connector">→</div><div className="landing-evidence-column"><span className="landing-mono">THE RETEST</span><strong>0 px</strong><p>Measured again</p></div></div>
      </div></section>

      <section className="landing-retest-section" id="retest"><div className="landing-container landing-retest-grid">
        <div><span className="landing-eyebrow">The loop</span><h2>From “I think it’s fixed”<br/><span>to “I measured it.”</span></h2></div>
        <div className="landing-loop">{["Scan","Find","Show","Explain","Fix","Re-test"].map((item,index)=><div key={item} className="landing-loop-item"><b>{String(index+1).padStart(2,"0")}</b><span>{item}</span>{index<5 && <i>→</i>}</div>)}</div>
      </div></section>

      <section className="landing-cta-section"><div className="landing-container landing-cta-panel"><div><span className="landing-eyebrow">Try the workflow</span><h2>Bring us a URL.<br/><em>Leave with evidence.</em></h2></div><button className="landing-primary landing-primary-light" type="button" onClick={goToApp}>Analyze a website <span>↗</span></button></div></section>
    </main>

    <footer className="landing-footer"><div className="landing-container landing-footer-grid"><div><Logo/><p>Website UI analysis, built around evidence.</p></div><div className="landing-footer-links"><a href="#product">Product</a><a href="#how-it-works">How it works</a><a href="#evidence">Evidence</a><a href="#app/overview">Workspace</a></div><small>Visibilio · 2026</small></div></footer>
  </div>;
}
