# Visibilio Product Program

## North Star

Visibilio is an evidence-first website UI quality platform that helps teams **scan → find → show → explain → fix → re-test → track improvement**.

The product should create recurring value, not a one-off report:
- Scan a website
- Understand reproducible UI issues
- See the evidence behind each issue
- Make a change
- Re-test the same issue
- Track improvement over time

## Product surfaces

### Public marketing
- Clear product promise
- Concrete scanner/evidence examples
- No fake scan results
- CTA into Analyze
- URL-first entry point directly after the hero
- Communicate value before asking users to enter the workspace
- Explicitly serve developers, designers, and website owners
- “Start for free” as the primary acquisition action
- Avoid generic AI/SaaS visual patterns
- Treat the landing page itself as a demonstration of Visibilio's UI-quality standard

### Product shell
- Website context as the primary product object
- Overview
- Analyze / new audit
- Findings with inline evidence + next actions
- Scan history
- Settings
- Evidence is a finding-level destination, not a top-level navigation item

The MVP shell should not expose "Workspace" as a primary user-facing concept. A workspace can remain an internal tenancy/account boundary for future authentication, billing, collaboration, and project isolation, but the product UI should lead with the website being audited.

Do not reintroduce a floating navigation rail. Keep the shell conventional, calm, and information-dense.

## Core domain model

User
  -> Account / Workspace (internal tenancy boundary)
      -> Website
          -> ScanSession
              -> ViewportResult
                  -> Issue
                      -> Evidence
                      -> Explanation
                      -> SuggestedFix
              -> RetestSession

The first implementation may remain single-user/in-memory, but new APIs should preserve this shape so persistence can be added without redesigning the product.

## Milestone plan

### P0 — Product foundation
Status: largely complete.

- [x] React/TypeScript/Vite foundation
- [x] Design system and product principles
- [x] Application shell
- [x] CI foundation
- [x] Node-side Playwright scanner

### P1 — Deterministic audit engine
Status: complete for current rule set.

- [x] Horizontal overflow
- [x] Rendered element overflow
- [x] Missing image alt
- [x] Missing form-control accessible name
- [x] Missing html lang
- [x] Stable issue schema
- [x] Evidence measurements
- [x] Selector evidence
- [x] Regression tests

### P2 — Scan execution boundary
Status: in progress.

Current boundary: localhost-bound API + deterministic scanner. Public scanning remains disabled until redirect/navigation SSRF enforcement, DNS rebinding resistance, browser isolation, and resource/cost controls are complete.

- [x] Typed server API contract
- [x] HTTP/HTTPS validation
- [x] Credential rejection
- [x] Initial DNS/IP SSRF filtering
- [x] Request body limit
- [x] Scan timeout
- [ ] Redirect/navigation SSRF controls
- [ ] DNS rebinding-safe enforcement
- [ ] Browser isolation/sandbox strategy
- [x] Resource/cost limits (time/request/response budgets)
- [ ] Job lifecycle / queue
- [ ] Public deployment

Public scanning stays disabled until the remaining security and resource controls are complete.

### P3 — Real Analyze experience
Status: in progress.

- [x] URL entry
- [x] Loading state
- [x] Error state
- [x] Real API handoff
- [x] Step-by-step scan progress based on server status
- [x] Retry without losing target
- [x] Scan cancellation
- [x] Clear result summary

### P4 — Findings + Evidence
Status: partially complete.

- [x] Findings list
- [x] Severity grouping
- [x] Filters
- [x] Finding detail
- [x] Evidence data view
- [x] Screenshot artifact identity with stable session-scoped id
- [x] Finding status actions
- [x] “Show evidence” focused interaction
- [x] Screenshot binary serving / focused image viewer
- [ ] Empty/loading/error polish
- [ ] Mobile interaction polish

### P5 — Scan Session + persistence boundary
Goal: turn one scan response into a reusable product object.

- [x] Define ScanSession contract
- [x] Define stable scan id
- [x] Record started/completed timestamps
- [x] Record scan status
- [x] Store viewport results
- [x] Store findings
- [x] Store evidence artifact references
- [x] Separate current session from prior sessions
- [x] Add local in-memory Website/Scan stores as the domain boundary
- [x] Add durable PostgreSQL persistence adapter + explicit migration path
- [ ] Add persistence-backed production deployment validation

### P6 — AI Explanation
Goal: explain findings without changing evidence.

- [x] AI input contract
- [x] Plain-language explanation
- [x] Technical explanation
- [x] Evidence/context passed explicitly
- [x] Uncertainty handling
- [x] Invalid response handling
- [x] Retry behavior
- [x] Distinguish deterministic finding vs AI explanation in UI

### P7 — Suggested Fixes
Goal: move from understanding to action.

- [ ] Likely causes
- [ ] Implementation direction
- [ ] Optional code example
- [ ] Explicit suggestion labeling
- [ ] Uncertainty/caveats
- [ ] Finding-specific fix guidance
- [ ] Do not claim guaranteed outcomes

### P8 — Re-test
Goal: verify whether a change changed the measured result.

- [x] Re-run same rule
- [x] Preserve original evidence reference
- [x] Before/after measurement comparison
- [x] Resolved/unresolved determination
- [x] Safe finding matching
- [x] Changed-structure handling
- [ ] Re-test history

### P9 — Websites + History
Goal: make Visibilio useful repeatedly without exposing workspace/project semantics.

- [x] Website entity contract
- [x] In-memory Website store
- [x] Website switcher
- [x] Site-scoped scan history
- [x] Scan history
- [x] Previous/current comparison model
- [x] Findings resolved since previous scan
- [x] New findings since previous scan
- [x] History movement summary
- [ ] Overview “health movement” summary
- [ ] Persistent evidence/artifacts

### P10 — Public SaaS infrastructure
Goal: serve real users safely and economically.

- [ ] Authentication
- [ ] Workspace/project isolation
- [ ] Queue/job worker
- [ ] Browser sandboxing
- [ ] Navigation and redirect controls
- [ ] Resource/time/cost budgets
- [ ] Screenshot/artifact storage
- [ ] Rate limiting
- [ ] Abuse protection
- [ ] Observability
- [ ] Production deployment
- [ ] Privacy/data retention policy

### P11 — Monetization readiness
Goal: create a sustainable paid product after core value is proven.

- [ ] Usage metering
- [ ] Scan quotas
- [ ] Free trial / limited free tier
- [ ] Paid plans based on meaningful usage
- [ ] Billing provider integration
- [ ] Upgrade prompts tied to actual limits
- [ ] Account/workspace settings
- [ ] Billing history/invoices
- [ ] Usage visibility

Do not implement billing before users can reliably complete the core loop.

### P12 — UX/product polish
Goal: make the proven workflow feel excellent.

Landing-page polish is part of the product, not a separate marketing exercise.

- [ ] Navigation hierarchy refinement
- [ ] Desktop/tablet/mobile behavior
- [ ] Keyboard/focus coverage
- [ ] Reduced-motion behavior
- [ ] Skeleton/loading polish
- [ ] Error recovery
- [ ] Density/whitespace tuning
- [ ] Screenshot/evidence interaction polish
- [ ] Landing-page product proof
- [ ] Consistent copy and terminology

## Pricing/business validation path

The first business objective is not “add payments”; it is proving repeated scanning value.

Track product signals before monetization:
- scans started
- scans completed
- findings opened
- evidence opened
- re-tests completed
- issues resolved
- repeat scans per website
- time between first scan and next scan

Potential future packaging:
- Free: limited scans/month
- Pro: more scans, history, AI explanations, exports
- Team: shared projects, collaboration, higher limits

Pricing should be validated against actual resource cost and observed usage, not guessed early.

## Non-goals

Do not initially build:
- full WCAG certification
- exhaustive visual design judgment
- automatic code modification
- large crawler infrastructure
- enterprise administration
- team features before the single-user loop is valuable

## Current implementation rule

Every feature must preserve:
Browser scan → deterministic finding → evidence → explanation → fix guidance → re-test.

Measured evidence must remain independently inspectable.
