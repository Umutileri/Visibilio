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

The marketing surface currently uses DM Sans; product-shell typography should remain tokenized and consolidated before adding additional font dependencies.

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

The landing page is a product surface, not a separate brochure. Its primary job is to make Visibilio's value understandable quickly, show evidence rather than abstract promises, and move the visitor toward an initial page analysis.

### Marketing hierarchy

The page should answer these questions in order:

1. **What is Visibilio?** A website UI analysis and quality tool.
2. **What does it find?** Measurable UI problems in a real browser.
3. **Why trust the result?** Findings retain viewport, selector, and measurement evidence.
4. **What happens next?** The user can understand the finding, act on it, and re-test the same check.
5. **What should I do now?** Start with a page or URL.

The first viewport should communicate category + outcome + product proof + one clear primary action. Clever wording must not replace product clarity.

### Visual hierarchy

Use a deliberate hierarchy:

- **Primary:** headline, product evidence, primary CTA, measured result
- **Secondary:** explanatory copy, workflow labels, audience context
- **Tertiary:** metadata, navigation helpers, decorative rules

Do not give the same visual weight to every section. Every major section needs one dominant idea.

### Story architecture

Use the sequence:

**Promise → Product proof → URL action → Problem framing → Workflow → Audience value → Evidence principle → Before/after result → Objections → Final action**

The workflow should read as one connected system:

**Find → Measure → Explain → Fix → Re-test**

Avoid presenting these as unrelated feature cards.

### Product proof rules

Marketing visuals must resemble believable product output.

Prefer:
- measured values
- viewport dimensions
- selectors
- finding status
- before/after comparisons
- explicit distinction between deterministic evidence and AI interpretation

Avoid:
- generic dashboards
- decorative charts with no product meaning
- fake social proof
- invented customer metrics
- unexplained AI effects

### CTA rules

Use one primary acquisition action throughout the page: **Start for free / Analyze a page**.

Secondary links may explain the workflow but should not compete visually with the primary action.

### Density and whitespace

Whitespace should separate concepts, not create empty screens. If a section has a large vertical area, that space must support a clear visual or narrative purpose.

Prefer shorter, denser transitions around workflow explanations and stronger breathing room around major narrative changes.

### Mobile rules

The mobile experience must preserve the same narrative hierarchy:

- navigation becomes compact and accessible
- primary CTA remains easy to reach
- product proof stacks without losing labels
- workflow stays visibly connected
- metrics remain legible
- no horizontal scrolling
- no section relies on hover
- headings should not become isolated from their supporting content

### Motion

Motion should explain state or progression. Avoid animation that exists only to make the page feel “AI-like”.

### Validation

Landing changes are not complete until they have been checked at representative widths (small phone, large phone, tablet, desktop) and interactive states (menu open/closed, anchor navigation, language switch, URL submission, reduced motion).
