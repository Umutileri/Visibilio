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

The application shell uses a conventional persistent workspace layout. Do not reintroduce a floating navigation rail.

Primary navigation: Overview, Analyze, Findings, Evidence, History, Settings.

The screen hierarchy should prioritize project/website context, current scan state, findings summary, finding detail, evidence, and next action. Important state must never depend on hover alone. Preserve the URL during retry/error flows and keep the selected finding when moving between Findings and Evidence.

Prefer an engineering-tool/editorial layout over a generic card-heavy AI dashboard. Use compact summaries, lists, tables, and metadata rows when they make findings easier to compare.
