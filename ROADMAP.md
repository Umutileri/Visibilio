# Visibilio Roadmap

The roadmap is milestone-driven. Each milestone should produce a small, testable increment.

## M0 — Project Foundation

**Goal:** Establish the development foundation.

- [x] Create GitHub repository
- [x] Create core product documentation
- [x] Define agent guidelines
- [x] Define initial design system
- [ ] Initialize React + TypeScript + Vite
- [ ] Configure Tailwind CSS
- [ ] Add linting and formatting
- [ ] Add application shell
- [ ] Add basic CI checks

**Exit criteria:** The app installs, runs locally, builds successfully, and basic checks pass.

## M1 — Local Website Scan

**Goal:** Execute a controlled test page and collect browser measurements.

- [ ] Define scan input
- [ ] Add Playwright runner
- [ ] Add initial viewport presets
- [ ] Capture page/document dimensions
- [ ] Detect horizontal overflow
- [ ] Return structured scan output
- [ ] Add error and timeout handling

**Exit criteria:** A controlled test page can be scanned and return reproducible measurement data.

## M2 — First Issue System

**Goal:** Convert measurements into a stable issue model.

- [ ] Define issue schema
- [ ] Define rule identifiers
- [ ] Implement horizontal-overflow rule
- [ ] Define deterministic severity behavior
- [ ] Store detection evidence
- [ ] Add positive tests
- [ ] Add negative tests
- [ ] Add boundary tests

**Exit criteria:** Horizontal overflow can be detected consistently with automated tests and clear evidence.

## M3 — Visual Evidence

**Goal:** Make findings easy to understand.

- [ ] Capture screenshots
- [ ] Store viewport metadata
- [ ] Show measured values
- [ ] Identify affected selectors where practical
- [ ] Add issue evidence view

**Exit criteria:** A user can see visual evidence and the measurements behind an issue.

## M4 — Audit Dashboard

**Goal:** Turn scan results into a usable product interface.

- [ ] Issue summary
- [ ] Severity grouping
- [ ] Issue list
- [ ] Issue detail view
- [ ] Filters
- [ ] Loading state
- [ ] Empty state
- [ ] Error state
- [ ] Responsive layout

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
