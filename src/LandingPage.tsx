import { useEffect, useRef, useState } from "react";

const links = [
  ["#product", "Product"],
  ["#how-it-works", "How it works"],
  ["#evidence", "Evidence"],
  ["#retest", "Re-test"],
] as const;

const steps = [
  { id: "detect", step: "01", label: "Detect", title: "Find the thing that breaks.", copy: "Measure real browser state first. No guessed scores, no invented selectors." },
  { id: "evidence", step: "02", label: "Evidence", title: "See the measurement behind it.", copy: "A finding stays attached to the viewport, selector and values that produced it." },
  { id: "explain", step: "03", label: "Explain", title: "Understand why it matters.", copy: "AI comes after detection to explain a confirmed issue without replacing the evidence." },
  { id: "retest", step: "04", label: "Re-test", title: "Ship the fix. Prove the change.", copy: "Run the same check again and compare before and after evidence." },
];

function Brand() {
  return <a className="landing-brand" href="#top" aria-label="Visibilio home"><img src="/Visibilio/visibilio-icon.svg" alt="" aria-hidden="true" /><span>Visibilio</span></a>;
}

function HeroEvidence() {
  return <div className="landing-hero-evidence" aria-label="Example evidence panel">
    <div className="landing-window-head"><span/><span/><span/><code>visibilio / finding</code></div>
    <div className="landing-window-grid">
      <div className="landing-site-frame">
        <div className="landing-site-head"><b>Example site</b><span>390 × 844</span></div>
        <div className="landing-site-body"><i className="line line-a"/><i className="line line-b"/><div className="landing-site-cards"><i/><i/><i/></div><span className="landing-overflow-callout">+34 px</span></div>
      </div>
      <aside className="landing-evidence-card"><small>MEASURED EVIDENCE</small><strong>horizontalOverflow</strong><b>34 px</b><dl><div><dt>viewport</dt><dd>390 px</dd></div><div><dt>document</dt><dd>424 px</dd></div><div><dt>selector</dt><dd>.pricing-grid</dd></div></dl><p>Evidence first. Explanation second.</p></aside>
    </div>
  </div>;
}

function StepVisual({ id }: { id: string }) {
  if (id === "detect") return <div className="landing-demo landing-demo-detect"><div className="demo-page"><i/><i/><i/><div className="demo-overflow"/></div><div className="demo-note"><small>DETECTED</small><strong>34 px outside viewport</strong><span>.pricing-grid · mobile</span></div></div>;
  if (id === "evidence") return <div className="landing-demo landing-demo-evidence"><div className="measure-cells">{["viewportWidth|390","documentWidth|424","overflow|34 px","selector|.pricing-grid"].map(pair=>{const [label,value]=pair.split("|");return <div key={label}><small>{label}</small><strong>{value}</strong></div>;})}</div><div className="measure-line"><i/><i/><span>390 px viewport</span></div></div>;
  if (id === "explain") return <div className="landing-demo landing-demo-explain"><div><small>CONFIRMED FINDING</small><strong>Document width exceeds viewport.</strong></div><div><small>AI EXPLANATION</small><p>This can create horizontal scrolling on smaller screens. Check fixed-width children and grid sizing first.</p></div></div>;
  return <div className="landing-demo landing-demo-retest"><div><small>BEFORE</small><strong>+34 px</strong><span>overflow</span></div><b>→</b><div><small>AFTER</small><strong>0 px</strong><span>within viewport</span></div></div>;
}

export default function LandingPage() {
  const [menuOpen,setMenuOpen]=useState(false);
  const [active,setActive]=useState(0);
  const refs=useRef<Array<HTMLDivElement|null>>([]);

  useEffect(() => {
    const observer=new IntersectionObserver(entries => {
      const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if (!visible) return;
      const index=Number((visible.target as HTMLElement).dataset.index);
      if (!Number.isNaN(index)) setActive(index);
    }, {threshold:[0.35,0.6,0.8], rootMargin:"-18% 0px -18% 0px"});
    refs.current.forEach(node=>node&&observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const openApp=()=>{window.location.hash="#app/analyze";setMenuOpen(false);};

  return <div className="landing-page" id="top">
    <header className="landing-nav-wrap"><div className="landing-nav">
      <Brand/>
      <nav className={menuOpen?"landing-nav-links is-open":"landing-nav-links"} aria-label="Main navigation">
        {links.map(([href,label])=><a key={href} href={href} onClick={()=>setMenuOpen(false)}>{label}</a>)}
        <button className="landing-mobile-cta" type="button" onClick={openApp}>Open Visibilio</button>
      </nav>
      <div className="landing-nav-actions"><a className="landing-signin" href="#app/overview">Open workspace</a><button className="landing-cta" type="button" onClick={openApp}>Try it free</button><button className="landing-menu-button" type="button" aria-expanded={menuOpen} aria-label="Toggle navigation" onClick={()=>setMenuOpen(v=>!v)}><span/><span/></button></div>
    </div></header>

    <main>
      <section className="landing-hero"><div className="landing-container landing-hero-grid">
        <div className="landing-hero-copy"><span className="landing-eyebrow">Website UI quality, backed by evidence.</span><h1>See what’s wrong.<br/><em>Fix what matters.</em></h1><p>Visibilio turns browser measurements into findings you can inspect, understand, and re-test.</p>
          <div className="landing-hero-actions"><button className="landing-primary" type="button" onClick={openApp}>Analyze a website <span>↗</span></button><a className="landing-secondary" href="#how-it-works">See how it works <span>↓</span></a></div>
          <div className="landing-proof-row"><span><i/> Browser measured</span><span><i/> Deterministic checks</span><span><i/> Re-testable</span></div>
        </div>
        <div><HeroEvidence/><div className="landing-proof-caption"><span>01 / A REAL FINDING</span><strong>Not a score. A fact you can investigate.</strong></div></div>
      </div></section>

      <section className="landing-marquee" aria-label="Product loop"><div className="landing-marquee-track"><span>MEASURE</span><i>•</i><span>DETECT</span><i>•</i><span>SHOW EVIDENCE</span><i>•</i><span>EXPLAIN</span><i>•</i><span>FIX</span><i>•</i><span>RE-TEST</span><i>•</i><span>MEASURE</span><i>•</i><span>DETECT</span><i>•</i><span>SHOW EVIDENCE</span><i>•</i><span>EXPLAIN</span><i>•</i><span>FIX</span><i>•</i><span>RE-TEST</span></div></section>

      <section className="landing-intro-section" id="product"><div className="landing-container landing-two-col"><div><span className="landing-eyebrow">The problem</span><h2>“Something feels off.”<br/><span>That’s not enough.</span></h2></div><div className="landing-prose"><p>A website can look wrong without telling you why. Visibilio starts with a more useful question: <strong>what actually happened in the browser?</strong></p><p>The product connects a measured result to the page, the affected element, and the next action—before AI enters the loop.</p></div></div></section>

      <section className="landing-feature-section" id="how-it-works"><div className="landing-container landing-feature-layout">
        <div className="landing-feature-sticky"><span className="landing-eyebrow">How it works</span><div className="landing-feature-title"><span>{steps[active].step} / 04</span><h2>{steps[active].title}</h2><p>{steps[active].copy}</p></div><div className="landing-feature-nav" role="tablist" aria-label="Feature steps">{steps.map((s,i)=><button key={s.id} type="button" className={i===active?"is-active":""} onClick={()=>refs.current[i]?.scrollIntoView({behavior:"smooth",block:"center"})}><span>{s.step}</span><strong>{s.label}</strong></button>)}</div></div>
        <div className="landing-feature-scroll">{steps.map((s,i)=><div key={s.id} className="landing-feature-step" data-index={i} ref={node=>{refs.current[i]=node;}}><div className="landing-feature-art"><div className="landing-feature-chrome"><span>Visibilio / {s.label}</span><span>live evidence</span></div><StepVisual id={s.id}/></div></div>)}</div>
      </div></section>

      <section className="landing-evidence-section" id="evidence"><div className="landing-container"><div className="landing-section-heading"><span className="landing-eyebrow">Evidence first</span><h2>AI can explain a fact.<br/><em>It shouldn’t invent one.</em></h2></div><div className="landing-evidence-band"><div className="landing-evidence-column"><span className="landing-mono">THE BROWSER</span><strong>390 × 844</strong><p>Controlled viewport</p></div><div className="landing-evidence-connector">→</div><div className="landing-evidence-column"><span className="landing-mono">THE RULE</span><strong>+34 px</strong><p>Horizontal overflow</p></div><div className="landing-evidence-connector">→</div><div className="landing-evidence-column"><span className="landing-mono">THE EXPLANATION</span><strong>Why it matters</strong><p>Clearly labeled AI context</p></div><div className="landing-evidence-connector">→</div><div className="landing-evidence-column"><span className="landing-mono">THE RE-TEST</span><strong>0 px</strong><p>Measured again</p></div></div></div></section>

      <section className="landing-retest-section" id="retest"><div className="landing-container landing-retest-grid"><div><span className="landing-eyebrow">The loop</span><h2>From “I think it’s fixed”<br/><span>to “I measured it.”</span></h2></div><div className="landing-loop">{["Scan","Find","Show","Explain","Fix","Re-test"].map((item,index)=><div key={item} className="landing-loop-item"><b>{String(index+1).padStart(2,"0")}</b><span>{item}</span>{index<5&&<i>→</i>}</div>)}</div></div></section>

      <section className="landing-cta-section"><div className="landing-container landing-cta-panel"><div><span className="landing-eyebrow">Try the workflow</span><h2>Bring us a URL.<br/><em>Leave with evidence.</em></h2></div><button className="landing-primary landing-primary-light" type="button" onClick={openApp}>Analyze a website <span>↗</span></button></div></section>
    </main>

    <footer className="landing-footer"><div className="landing-container landing-footer-grid"><div><Brand/><p>Website UI analysis, built around evidence.</p></div><div className="landing-footer-links">{links.map(([href,label])=><a key={href} href={href}>{label}</a>)}<a href="#app/overview">Workspace</a></div><small>Visibilio · 2026</small></div></footer>
  </div>;
}
