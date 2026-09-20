# Visibilio Roadmap

> Detailed product/business program: [PRODUCT_PROGRAM.md](./PRODUCT_PROGRAM.md)

The roadmap is milestone-driven. Each milestone should produce a small, testable increment.

## M0 — Project Foundation

**Goal:** Establish the development foundation.

- [x] Create GitHub repository
- [x] Create core product documentation
- [x] Define agent guidelines
- [x] Define initial design system
- [x] Initialize React + TypeScript + Vite
- [x] Configure Tailwind CSS
- [x] Add linting and formatting
- [x] Add application shell
- [x] Add basic CI checks

**Exit criteria:** The app installs, runs locally, builds successfully, and basic checks pass.

## M1 — Local Website Scan

**Goal:** Execute a controlled test page and collect browser measurements.

- [x] Define scan input
- [x] Add Playwright runner
- [x] Add initial viewport presets
- [x] Capture page/document dimensions
- [x] Detect horizontal overflow
- [x] Return structured scan output
- [x] Add error and timeout handling

**Exit criteria:** A controlled test page can be scanned and return reproducible measurement data.

## M2 — First Issue System

**Goal:** Convert measurements into a stable issue model.

- [x] Define issue schema
- [x] Define rule identifiers
- [x] Implement horizontal-overflow rule
- [x] Define deterministic severity behavior
- [x] Store detection evidence
- [x] Add positive tests
- [x] Add negative tests
- [x] Add boundary tests

**Exit criteria:** Horizontal overflow can be detected consistently with automated tests and clear evidence.

## M3 — Deterministic UI Audit Rules

**Goal:** Turn the scanner into a reusable rule runner with evidence-backed responsive and accessibility findings.

- [x] Separate detection rules from the Playwright page runner
- [x] Detect rendered elements that extend beyond the viewport
- [x] Detect images without an alt attribute
- [x] Detect form controls without a programmatic name
- [x] Detect documents without a language
- [x] Add selector evidence where practical
- [x] Add regression coverage for representative findings
- [x] Verify the full CI workflow on GitHub

**Exit criteria:** A controlled page scan can produce multiple deterministic UI findings across configured viewports without relying on AI.

## M4 — Visual Evidence + Audit Workspace

**Goal:** Make findings easy to understand.

- [x] Capture screenshots
- [x] Store viewport metadata
- [x] Show measured values
- [x] Identify affected selectors where practical
- [x] Add issue evidence view
- [x] Connect workspace to typed scan API
- [ ] Serve screenshots through stable artifact URLs
- [ ] Add focused evidence viewer

**Exit criteria:** A user can see visual evidence and the measurements behind an issue.

## M4 — Audit Dashboard

**Goal:** Turn scan results into a usable product interface.

- [x] Issue summary
- [x] Severity grouping
- [x] Issue list
- [x] Issue detail view
- [x] Filters
- [x] Loading state
- [x] Empty state
- [x] Error state
- [x] Responsive layout

**Exit criteria:** A user can move from a completed scan to a clear issue overview and detail.

## M5 — AI Explanation

**Goal:** Add AI interpretation on top of structured findings.

- [ ] Define AI input contract
- [ ] Generate plain-language explanations
- [ ] Generate technical explanations
- [ ] Preserve measured evidence separately
- [ ] Add uncertainty handling
- [ ] Add invalid/failed-response handling

**Exit criteria:** AI explains existing structured findings without inventing evidence.

## M6 — Suggested Fixes

**Goal:** Make findings actionable.

- [ ] Suggest likely causes
- [ ] Suggest implementation directions
- [ ] Provide code examples where appropriate
- [ ] Label suggestions as suggestions
- [ ] Add safety/uncertainty boundaries

**Exit criteria:** A user can move from a finding to a practical next step without the system overstating certainty.

## M7 — Re-test

**Goal:** Verify whether an issue changed after a fix.

- [ ] Re-run the same rule
- [ ] Compare before/after measurements
- [ ] Show resolved/unresolved state
- [ ] Preserve previous evidence
- [ ] Handle changed page structure safely

**Exit criteria:** The system can demonstrate whether the same issue remains or has been resolved.

## M8 — Public Website Scanning

**Goal:** Safely extend scanning to user-provided public URLs.

- [ ] URL validation
- [ ] SSRF protections
- [ ] Request/time/resource limits
- [ ] Browser sandboxing strategy
- [ ] Job/queue architecture
- [ ] Scan status handling
- [ ] Failure reporting

**Exit criteria:** Public scanning works within explicit security and resource constraints.

## Beyond MVP

Possible future work:

- Additional responsive/layout rules
- Accessibility-oriented checks
- Before/after comparison
- Browser/device matrix
- Reports and exports
- Human-assisted UI Fix Service
- Team workspaces
- Browser extension
- Learning resources

The roadmap should change when evidence from real usage suggests a different priority.
