# Visibilio Product Definition

## Product statement

Visibilio is a website UI analysis and improvement platform that makes website problems easier to **detect, understand, see, fix, and verify**.

**Core loop:** Detect → Explain → Show → Suggest → Re-test

## Problem

Website owners can notice that something looks wrong without knowing the cause, affected viewport, impact, or next step.

Developers can diagnose these problems, but manual responsive checking and reproduction take time.

Visibilio connects a simple explanation with technical evidence.

## Target users

### Website owners
Need clear language, visual evidence, context, and actionable next steps.

### Frontend developers
Need reproducible checks, measurements, affected elements, selectors, viewport data, and implementation guidance.

### Designers
Need visual evidence and carefully qualified observations about layout, hierarchy, spacing, and readability.

## Product principles

### Evidence before interpretation

A confirmed defect should be supported by measurable browser evidence or an explicit deterministic rule whenever practical.

### AI assists; it does not decide silently

AI may explain structured findings and suggest possibilities. It must not invent measurements, selectors, test results, or capabilities.

### Simple by default, technical when useful

Every issue should be understandable by a non-developer while still exposing enough technical context for a developer to act.

### Separate fact from suggestion

Measured facts, deterministic findings, and AI-generated suggestions must remain distinguishable in the product.

### Reproducibility matters

A user should be able to understand how a finding was produced and, where practical, reproduce it.

## Core flow

1. **Detect** — run checks against the target page.
2. **Explain** — describe the finding in appropriate language.
3. **Show** — provide visual and technical evidence.
4. **Suggest** — propose a next step or possible fix.
5. **Re-test** — run the relevant check again and compare results.

## MVP scope

### Included

- Test URL input
- Controlled viewport scanning
- Playwright-based page execution
- Deterministic horizontal-overflow detection
- Screenshot/evidence capture
- Structured issue results
- Plain-language explanation
- Technical details
- Explicit severity rules
- Re-test of the same detection rule

### Not initially included

- Full WCAG certification
- Guaranteed browser/device compatibility
- Automatic code changes
- Complete visual-design judgment
- Guaranteed conversion optimization
- Exhaustive UI issue detection
- Large-scale crawling infrastructure
- Complex billing, teams, or enterprise administration

## Detection model

The first detection engine should favor rules that can be tested with browser data.

Examples for future rules:

- document width exceeds viewport width
- an element extends outside the viewport
- a fixed element overlaps another element
- text is clipped
- an interactive element becomes unreachable

Subjective observations should be phrased as observations or suggestions, not confirmed defects.

## Issue model

Every issue should have a stable structured representation.

Suggested fields:

- id
- rule
- category
- title
- severity
- description
- url
- viewport
- selector (when available)
- measurements (when available)
- evidence
- detectedAt
- status

The schema can evolve, but new fields should have a clear purpose.

## Severity

Severity must be rule-based and explicit.

Initial categories:

- **High** — materially blocks or significantly breaks the intended experience.
- **Medium** — materially degrades the experience without fully blocking it.
- **Low** — limited-impact issue or polish-level concern.

A rule should explain why a severity value was assigned.

## AI boundaries

AI must not:

- claim a measurement it did not receive
- invent affected elements
- claim a browser/device was tested when it was not
- convert an aesthetic preference into a confirmed defect
- promise a fix will improve conversion or performance without evidence
- silently override deterministic detection results

## Success criteria

The early prototype is useful when a user can:

1. Scan a test page.
2. See a reproducible finding.
3. View evidence for the finding.
4. Understand the finding without browser internals.
5. Access useful technical context.
6. Re-test after making a change.

## Non-goals for now

Do not optimize early development for breadth.

The first objective is to make a small number of findings **reliable, explainable, and reproducible**.
