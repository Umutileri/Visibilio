<div align="center">

# Visibilio

### See what's wrong. Fix what matters.

AI-assisted website UI analysis that helps you **find**, **understand**, and **fix** real interface problems.

<p>
  <img src="https://img.shields.io/badge/status-in%20development-152D35?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/React-TypeScript-152D35?style=flat-square" alt="React + TypeScript" />
  <img src="https://img.shields.io/github/stars/Umutileri/Visibilio?style=flat-square" alt="GitHub Stars" />
</p>

</div>

---

## What is Visibilio?

Visibilio is a **website UI analysis and improvement platform** built to make website problems easier to see, understand, and fix.

Instead of simply giving you a score, Visibilio is designed around one simple loop:

**Scan → Find → Show → Explain → Fix → Re-test**

It aims to answer:

> **What is wrong?**  
> **Where is it happening?**  
> **Why does it matter?**  
> **How can I fix it?**  
> **Did the fix work?**

---

## Why Visibilio?

Website problems are often easy to notice but difficult to understand.

A website owner might see that something feels wrong without knowing why. A developer might know where to look, but still spend time manually checking different viewport sizes and reproducing issues.

Visibilio aims to connect both perspectives.

**For everyone**
- Clear explanations
- Visual evidence
- Simple language
- Actionable next steps

**For developers**
- Technical details
- Affected elements
- Viewport information
- Reproducible checks
- Implementation guidance

---

## Evidence first. AI second.

Visibilio is built around **measurable browser data and reproducible checks**.

The system should first determine what actually happened. AI can then help explain the result and suggest possible improvements.

```text
Browser
   ↓
Browser Measurements
   ↓
Deterministic Finding
   ↓
Evidence
   ↓
AI Explanation
   ↓
Fix Guidance
   ↓
Re-test
```

This keeps measured evidence separate from interpretation.

---

## MVP

The first version is intentionally focused.

> Product direction: Visibilio is being built as a repeat-use evidence platform, not a one-time audit report. The long-term loop is Scan → Find → Show → Explain → Fix → Re-test → Track improvement.

See [`PRODUCT_PROGRAM.md`](./PRODUCT_PROGRAM.md) for the implementation and business-readiness plan.

| Capability | Goal |
|---|---|
| 🔍 Website scanning | Scan a test website across selected viewports |
| ⚠️ UI issue detection | Detect measurable responsive problems |
| 🖼️ Visual evidence | Capture screenshots and measurements |
| 📋 Issue reports | Turn findings into clear reports |
| ✨ AI explanations | Explain findings while keeping measured evidence separate |
| 🔄 Re-test | Verify whether a change resolved the issue |

The current deterministic rule set includes horizontal overflow, rendered element overflow, missing image alt text, missing form-control accessible names, and missing document language.

---

## Tech direction

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS

**Testing / analysis**
- Playwright

The architecture is currently split between the React application shell, a Node/Playwright scanner, typed REST APIs, and a PostgreSQL persistence adapter. Public URL scanning remains gated behind the remaining SSRF, browser-isolation, queue, rate-limit, and observability controls.

---

## Design

Visibilio follows a clean and calm visual language.

| Token | Value |
|---|---|
| **Deep Teal** | `#152D35` |
| **Soft Sage** | `#D4ECDD` |

> **Clarity over decoration.**

The interface should help users understand website problems rather than create more visual noise.

---

## Roadmap

See [`PRODUCT_PROGRAM.md`](./PRODUCT_PROGRAM.md) for the current milestone program.

See [`ROADMAP.md`](./ROADMAP.md) for the detailed plan.

---

## Principles

**Evidence over assumptions.**  
Measured results should come before AI interpretation.

**Small steps.**  
Each milestone should produce a small, testable improvement.

**Human-driven product decisions.**  
AI can assist implementation, but product direction and UX decisions remain human-driven.

**Honest output.**  
Uncertain observations should not be presented as confirmed defects.

---

## Documentation

[`PRODUCT.md`](./PRODUCT.md) ·
[`ROADMAP.md`](./ROADMAP.md) ·
[`AGENTS.md`](./AGENTS.md) ·
[`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)

---

<div align="center">

🚧 **Early development**

**Make website problems visible.**

</div>
