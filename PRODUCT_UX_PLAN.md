# Visibilio Product & UX Delivery Plan

## A — Foundation

### A1 — Close M3
- Finish PR #30 only when formatting, build, lint, and scanner tests are green.
- Keep deterministic findings evidence-backed and tested.

### A2 — Safe scanner boundary
- Keep Playwright out of the Vite client bundle.
- Define a typed scan API before real scan wiring.
- Require URL validation, SSRF protection, resource limits, and browser isolation before public scanning.

**Exit:** The client can consume scan results without importing the scanner runtime.

## B — Product shell

### B1 — Information architecture
Primary areas:
- Overview
- Analyze
- Findings
- History
- Settings

Evidence is a finding-level detail surface, reached from a finding rather than promoted to a top-level destination.

The product should be organized around the **website being audited**. "Workspace" may exist internally as an account/tenancy boundary, but it should not be the primary navigation or headline concept in the MVP.

Keep navigation stable and predictable. Do not use a floating navigation rail. Keep the main content visually dominant on desktop and mobile.

**Exit:** A user can tell where to start, where results live, and where history lives.

### B2 — Analyze workflow
Support these explicit states:
- Idle
- Validating
- Scanning
- Completed
- Failed
- Empty

Show meaningful scan stages and recovery actions.

**Exit:** A user can start a scan, understand its progress, and recover from failure.

### B3 — Findings workspace
Include:
- Total findings
- Severity and category filters
- Sort/filter controls
- Finding list
- Selected finding state
- Clear empty state

**Exit:** A user can reach a specific finding quickly.

### B4 — Evidence detail
For each finding, show:
1. What happened
2. Where it happened
3. The measured evidence
4. Why it matters
5. Suggested next action

Use progressive disclosure for selectors and implementation detail.

**Exit:** A finding can be understood and reproduced from the shown evidence.

## C — SaaS structure

### C1 — History
Show scan time, site/project, finding count, status, and entry to scan details.

### C2 — Websites
Use the model:
**User → Account/Workspace (internal) → Website → Scans → Findings → Evidence**

A user should be able to have multiple websites later without introducing project-management semantics that do not yet exist. A "project" abstraction can be introduced when the product has a real need for grouping multiple sites, environments, or collaborators.

### C3 — Comparison
Start with:
- Finding count change
- New findings
- Resolved findings
- Changed measurements

**Exit:** A user can see what changed between scans.

## D — Trust and accessibility

### D1 — Application baseline
Keyboard navigation, visible focus, semantic headings, labels, clear errors, reduced motion, contrast, responsive behavior, and non-color status cues.

### D2 — Complete states
Every important view has loading, success, empty, error, disabled, and retry states.

### D3 — Trust surfaces
Show scan time, viewport, rules run, and evidence availability. Separate measurements from interpretation and suggestions.

## E — Intelligence

### E1 — AI contract
AI receives structured findings and evidence. It may explain or suggest, but cannot invent measurements, selectors, tested viewports, or deterministic results.

### E2 — Suggested fixes
Add implementation guidance and clearly label uncertainty.

### E3 — Re-test
Re-run relevant rules and compare before/after evidence.

## F — Production scanning
- Server-side scan API
- URL validation and SSRF controls
- Resource limits and browser isolation
- Job status and retry behavior
- Public URL scanning

Public scanning remains gated by these controls.

## Acceptance checklist
- First action is obvious.
- Navigation is predictable.
- Scan state is understandable.
- Many findings remain readable.
- Evidence is easy to inspect.
- Technical detail is progressive.
- Empty and error states explain the next action.
- Mobile remains usable.
- Critical interactions support keyboard and focus.
- Visual styling reinforces clarity and evidence.

## Working order
A1 → A2 → B1 → B2 → B3 → B4 → C1 → C2 → C3 → D1 → D2 → D3 → E1 → E2 → E3 → F

## Design guardrails
- Prefer hierarchy, whitespace, and progressive disclosure over decoration.
- Keep navigation persistent and predictable.
- Treat evidence as a first-class product object.
- Design for non-developers first; expose technical detail progressively.
- Avoid generic AI SaaS patterns such as gradients, glow, floating assistants, and dense KPI grids.
