# Visibilio Design System

## Design direction

Visibilio should feel:

- modern
- calm
- intelligent
- professional
- clear
- trustworthy

Avoid excessive gradients, glows, decorative noise, and generic "AI aesthetic" patterns.

The interface should make the product itself the visual focus.

## Brand

### Primary

`#152D35` — Deep Teal

### Secondary

`#D4ECDD` — Soft Sage

Neutrals are not fixed yet. Choose them deliberately and verify contrast before standardizing them.

## Typography

Preferred UI fonts:

- Inter
- Geist

Preferred monospace fonts:

- Geist Mono
- JetBrains Mono

The final font choice should be made once the application shell exists rather than creating unnecessary dependency work early.

## Spacing and layout

Use a consistent spacing scale and responsive containers.

Prefer:

- generous whitespace
- clear alignment
- readable content widths
- simple grids
- predictable vertical rhythm

Avoid dense layouts unless the information genuinely requires density.

## Visual hierarchy

Prioritize:

1. What is the issue?
2. Where is it happening?
3. How was it detected?
4. Why does it matter?
5. What can the user do next?

Evidence should support the explanation rather than compete with it.

## Components

Initial component families:

- Button
- Input
- Card
- Badge
- Alert
- Tabs
- Issue Summary
- Issue Detail
- Screenshot / Evidence Viewer
- Viewport Selector
- Code Block
- Status Indicator

Do not build every component in advance. Create components when a real UI needs them.

## Responsive behavior

Visibilio itself must work across:

- mobile
- tablet
- desktop

Do not design desktop-first behavior that becomes unusable on smaller screens.

## Accessibility baseline

At minimum:

- semantic HTML
- keyboard navigation
- visible focus states
- sufficient color contrast
- labeled form controls
- meaningful button/link text
- sensible heading structure
- reduced-motion consideration for non-essential animation

## Interaction

Prefer predictable interactions and clear feedback.

Important states should be visually distinguishable:

- idle
- loading
- success
- warning
- error
- disabled

Do not rely on color alone to communicate state.

## Issue visualization

An issue view should make these pieces easy to scan:

**Finding → Evidence → Context → Suggested action**

Severity should be clear but not visually overwhelming.

## Design principle

> **Clarity over decoration.**

The UI should help users understand website problems, not create more visual noise.

## Product shell UX

The application shell uses a conventional persistent site-audit layout. Do not reintroduce a floating navigation rail.

Primary navigation: Overview, Analyze, Findings, History, Settings.
Evidence is a finding-level detail surface reached from a finding, not a top-level section. "Workspace" is an internal account/tenancy concept and should not dominate user-facing copy in the MVP.

The screen hierarchy should prioritize project/website context, current scan state, findings summary, finding detail, evidence, and next action. Important state must never depend on hover alone. Preserve the URL during retry/error flows and keep the selected finding when moving between Findings and Evidence.

Prefer an engineering-tool/editorial layout over a generic card-heavy AI dashboard. Use compact summaries, lists, tables, and metadata rows when they make findings easier to compare.


## Public marketing experience

The public landing page is part of the product experience. It must demonstrate the same UI quality that Visibilio promises to help users achieve.

### Navigation
- Keep the navigation persistent and unobtrusive.
- Prefer a compact product-site navigation over a traditional enterprise navbar.
- Primary action is “Start for free”.
- Secondary action opens the product workspace.
- Anchor navigation must have smooth, predictable scrolling.

### Page rhythm
The landing flow should read as:
1. Promise
2. Show the product in action
3. Invite the user to share a URL
4. Explain the problem and Visibilio's difference
5. Demonstrate the workflow
6. Explain audience value
7. Establish the evidence-first principle
8. Show the measurable outcome
9. End with a clear “Start for free” action

### Visual language
Avoid:
- looping keyword marquees
- decorative process banners
- generic AI dashboards
- excessive pills, gradients, glows, or floating ornament
- marketing claims that cannot be demonstrated by the product

Prefer:
- strong typographic hierarchy
- asymmetrical editorial composition where useful
- real product-shaped evidence
- restrained motion
- purposeful whitespace
- clear alignment and grid discipline

The landing page should itself be a small demonstration of evidence-backed interface quality.
