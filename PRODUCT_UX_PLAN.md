# Visibilio Product & UX Delivery Plan

UX work can move in parallel with scanner architecture.
Public URL scanning remains gated by security controls.

## Track A — Foundation / quality

### A1 — Close M3 cleanly
- Fix formatter and scanner-test failures in PR #30.
- Verify build, lint, format, and scanner tests.
- Merge only after complete CI is green.

**Exit:** PR #30 is green and merged.

### A2 — Preserve the safe scanner boundary
- Keep Playwright out of the Vite client bundle.
- Define the scan API contract before wiring real scans into the UI.
- Treat URL validation, SSRF protection, resource limits, and browser isolation as prerequisites.
- Public scanning remains blocked until those controls exist.

**Exit:** The client can use a typed scan contract without importing the scanner runtime.

## Track B — Product shell

### B1 — Product information architecture
Primary areas:
- Overview
- Analyze
- Findings
- Evidence
- History
- Settings

Rules:
- No floating navigation rail.
- Navigation stays stable and predictable.
- Main content remains visually dominant.
- Desktop and mobile share the same information architecture.

**Exit:** A user understands where to start, where results live, and where history lives.

### B2 — Analyze workflow
States:
- Idle
- Validating
- Scanning
- Completed
- Failed
- Empty

Progress should show meaningful scan stages rather than only a generic spinner.

**Exit:** A user can start a scan, understand its state, and recover from failure.

### B3 — Findings workspace
Core UI:
- Finding count
- Severity counts
- Category filters
- Sort/filter controls
- Finding list
- Selected finding state
- Clear empty state

**Exit:** A user can move from scan completion to a specific finding quickly.

### B4 — Evidence detail
Every finding should expose:
1. What happened
2. Where it happened
3. Evidence
4. Why it matters
5. Suggested next action

Technical context should be progressive rather than overwhelming.

**Exit:** A finding can be understood and reproduced from the information shown.

## Track C — Retention / SaaS structure

### C1 — Scan history
Include timestamp, URL/project, finding count, status, and scan detail entry.

**Exit:** Users can return to previous scans and understand their history.

### C2 — Projects / websites
Structure:
User → Website/Project → Scans → Findings → Evidence

**Exit:** Multiple websites can be represented without changing the core finding model.

### C3 — Before/after comparison
Start with finding count change, new findings, resolved findings, and changed measurements.

**Exit:** A user can see whether a subsequent scan changed the state of a finding.

## Track D — Trust and accessibility

### D1 — Application UX baseline
Keyboard navigation, visible focus, semantic headings, labels, clear errors, reduced motion,
contrast, responsive behavior, and non-color status cues.

### D2 — State completeness
Every meaningful view gets Loading, Success, Empty, Error, Disabled, and Retry states.

### D3 — Trust surfaces
Show scan time, viewport, rules run, and evidence availability.
Distinguish measured facts from suggestions.

## Track E — Intelligence

### E1 — AI explanation contract
AI receives structured findings and evidence.
- It may explain or suggest.
- It may not invent measurements, selectors, tested browsers/devices, or deterministic results.

### E2 — Suggested fixes
Add implementation guidance and label uncertainty.

### E3 — Re-test loop
Re-run the relevant rule and compare before/after evidence.

## Track F — Public scanning / production

### F1 — Server-side scan API
### F2 — URL validation + SSRF controls
### F3 — Resource limits + browser isolation
### F4 — Job status / retry behavior
### F5 — Public URL scanning

Public scanning stays behind these controls.

## UI/UX acceptance checklist

Before calling the product surface complete:
- First action is obvious.
- Navigation is predictable.
- Scan state is understandable.
- Results remain readable with many findings.
- Evidence is easy to inspect.
- Technical detail is progressive.
- Empty and error states explain what to do next.
- Mobile remains usable.
- Critical interactions support keyboard/focus.
- Visual styling reinforces evidence and clarity rather than generic AI decoration.

## Working order

1. A1 — Close M3
2. A2 — Safe scanner boundary
3. B1 — Product shell
4. B2 — Analyze
5. B3 — Findings
6. B4 — Evidence
7. C1 — History
8. C2 — Projects
9. C3 — Comparison
10. D1–D3 — Trust/accessibility
11. E1–E3 — Intelligence
12. F1–F5 — Production/public scanning

## Product design guardrails

- Prefer clear hierarchy, whitespace, and progressive disclosure over decorative UI.
- Keep navigation persistent and predictable; do not reintroduce a floating rail.
- Treat evidence as a first-class product object, not a secondary detail panel.
- Design for a non-developer reader first, then expose technical detail progressively.
- Avoid generic AI SaaS patterns: gradients, glow, floating assistants, and dense KPI grids.


UX work may start during A1/A2, but public scanning cannot bypass server or security prerequisites.
