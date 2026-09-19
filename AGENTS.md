# Visibilio Agent Guidelines

This file defines the default behavior for AI coding agents working in this repository.

## 1. Source of truth

Before coding, read:

1. `README.md`
2. `PRODUCT.md`
3. `ROADMAP.md`
4. `DESIGN_SYSTEM.md`

Then inspect the existing code before proposing or implementing changes.

When documents disagree, prefer the product definition and call out the conflict instead of silently choosing a direction.

## 2. Required workflow

For every non-trivial task:

1. Restate the task in concrete terms.
2. Inspect the relevant files and existing patterns.
3. Propose a small implementation plan.
4. List files that will change.
5. Identify tests and acceptance criteria.
6. Implement the smallest coherent change.
7. Run relevant checks and tests.
8. Review the diff for regressions, duplication, and unnecessary complexity.
9. Summarize what changed, what was tested, and any limitations.

For larger changes, stop after the planning stage and wait for human approval.

## 3. Human ownership

The human owner makes product, UX, visual, scope, and prioritization decisions.

The agent may suggest alternatives, but must not silently introduce:

- new product goals
- new target users
- major navigation changes
- new monetization behavior
- major architectural changes
- unsupported product claims

When requirements are ambiguous, choose the smallest reversible interpretation and state the assumption.

## 4. Evidence-first detection

Confirmed issues should be based on deterministic rules or measurable evidence whenever practical.

Never present an aesthetic preference as a confirmed defect.

Prefer:

> The document is 42px wider than the viewport.

Avoid:

> The page is badly designed.

For uncertain visual observations use qualified language such as:

- may
- could
- appears to
- consider

## 5. Keep detection and AI separate

Use this mental architecture:

**Browser measurement → detection rule → structured issue → AI explanation → optional suggestion**

Do not use an LLM to answer a question that a deterministic browser check can answer more reliably.

AI output must not silently alter the underlying measured result.

## 6. Code quality

Prefer:

- TypeScript
- small focused functions
- explicit types
- semantic HTML
- accessible interactions
- responsive layouts
- reusable components where reuse is real
- existing project patterns over new abstractions

Avoid:

- giant components
- duplicated business logic
- magic numbers without reason
- premature abstraction
- unnecessary state libraries
- unnecessary dependencies
- speculative infrastructure

## 7. Dependencies

Before adding a dependency:

1. Check the existing package set.
2. Check whether the platform or current stack already solves the problem.
3. Add a dependency only when it provides meaningful value.

Do not add packages merely for convenience when a small local implementation is clearer.

## 8. UI implementation

Follow `DESIGN_SYSTEM.md`.

Do not introduce arbitrary colors, typography, spacing, radii, shadows, or component patterns when an existing design token or pattern applies.

Every meaningful UI state should be considered:

- loading
- empty
- success
- error
- disabled
- keyboard/focus
- mobile
- tablet
- desktop

## 9. Testing requirements

Important detection rules must include:

- positive case
- negative case
- boundary case
- error/failure case when applicable

Bug fixes should normally include a regression test.

Do not mark a task complete based only on visual inspection when an automated check is practical.

Do not write or expose test-page URLs as part of user-facing scanning functionality unless the feature explicitly requires a local fixture.

## 10. Honest claims

Never claim:

- a feature works without testing it
- a rule is comprehensive when it is not
- accessibility is fully compliant unless explicitly verified
- all browsers/devices are supported unless tested
- an AI suggestion is guaranteed to work
- a screenshot or measurement exists when it was not actually captured

## 11. File and architecture discipline

Prefer modifying the smallest number of files necessary.

Do not reorganize the project, rename directories, or introduce a new architecture unless the task requires it or the change has clear value.

Keep business logic independent from presentation when practical.

## 12. Security and privacy

Treat user-provided URLs and page content as untrusted input.

Do not introduce:

- arbitrary command execution from user input
- unsafe URL fetching without constraints
- secret values in source code
- logging of sensitive data without a reason

For website scanning features, consider SSRF, resource limits, timeouts, and sandboxing before enabling arbitrary public URLs.

## 13. Completion report

After implementation, report:

- What changed
- Why it changed
- Tests/checks run
- Result of those checks
- Known limitations
- Any follow-up work required

The agent should leave the repository in a state another developer can understand and continue.