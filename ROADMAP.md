# Visibilio Roadmap

> Detailed implementation and business program: [PRODUCT_PROGRAM.md](./PRODUCT_PROGRAM.md)

The roadmap is milestone-driven. Each milestone should produce a small, testable increment.

## M0 — Project Foundation
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

## M1 — Deterministic Audit Engine
- [x] Define scan input and typed results
- [x] Add Playwright runner
- [x] Add viewport presets
- [x] Capture document/viewport dimensions
- [x] Detect horizontal overflow
- [x] Detect rendered element overflow
- [x] Detect missing image alt
- [x] Detect missing form-control accessible name
- [x] Detect missing document language
- [x] Store selector and measurement evidence
- [x] Add positive, negative, boundary, and regression tests

**Exit criteria:** Controlled page scans produce reproducible, evidence-backed findings across configured viewports.

## M2 — Product Shell + Findings
- [x] Website as the primary product object
- [x] Overview / Analyze / Findings / History / Settings navigation
- [x] Site-scoped scan history
- [x] Finding detail and filters
- [x] Screenshot capture and session-scoped artifact identity
- [x] Binary screenshot artifact serving
- [x] Focused evidence viewer
- [x] Retry and cancellation flows
- [x] Retest lineage and before/after comparison

**Exit criteria:** A user can scan a controlled website, inspect evidence, retest a finding, and see the result.

## M3 — Persistence + AI Explanation
- [x] Website and ScanSession repository contracts
- [x] In-memory storage for tests
- [x] PostgreSQL persistence adapter
- [x] Explicit database migration command
- [x] AI explanation input/output contract
- [x] Deterministic fallback explanation
- [x] HTTP explanation provider adapter
- [x] Provider response validation and retries
- [x] Finding explanation UI

**Exit criteria:** Scan history has a durable storage boundary and findings can receive clearly separated AI/fallback explanations.

## M4 — Scan Execution Boundary
- [x] HTTP/HTTPS validation
- [x] Credential rejection
- [x] Initial hostname/IP SSRF filtering
- [x] Request body limit
- [x] Scan timeout
- [x] Request-count budget
- [x] Response-byte budget
- [ ] Redirect/navigation SSRF hardening
- [ ] DNS rebinding-safe enforcement
- [ ] Browser isolation/sandbox strategy
- [ ] Queue/worker job lifecycle
- [ ] Rate limiting and abuse controls
- [ ] Observability
- [ ] Production deployment validation

**Exit criteria:** Arbitrary public URL scanning is enabled only after the remaining network, browser-isolation, queue, and abuse controls are verified.

## M5 — Suggested Fixes
- [ ] Identify likely causes from evidence
- [ ] Provide implementation directions
- [ ] Optional code examples
- [ ] Explicit suggestion labeling
- [ ] Uncertainty and safety boundaries

**Exit criteria:** A user can move from a finding to a practical next step without confusing suggestions with measured facts.

## M6 — Repeat-Use Intelligence
- [x] Site-scoped history
- [x] New-finding detection
- [x] Resolved-finding detection
- [x] History movement summary
- [ ] Overview health movement
- [ ] Persistent screenshot/object storage
- [ ] Retest history surface
- [ ] Cross-scan trend view

**Exit criteria:** Users can understand how a website changed across repeated scans.

## M7 — Public SaaS
- [ ] Authentication
- [ ] Account/website isolation
- [ ] Browser sandboxing
- [ ] Navigation and redirect controls
- [ ] Cost/usage metering
- [ ] Rate limiting
- [ ] Abuse protection
- [ ] Privacy and retention policy
- [ ] Production deployment
- [ ] Operational monitoring

**Exit criteria:** Real users can safely run scans within explicit security, privacy, and resource constraints.

## M8 — UX / Marketing Polish
- [ ] Landing navigation hierarchy refinement
- [ ] Landing desktop/tablet/mobile validation
- [ ] Keyboard/focus coverage
- [ ] Reduced-motion behavior
- [ ] Loading/error recovery polish
- [ ] Density and whitespace tuning
- [ ] Evidence interaction polish
- [ ] Landing product proof
- [ ] Copy and terminology consistency

**Exit criteria:** The public landing page and product shell demonstrate the same evidence-first quality bar.

## Beyond MVP
- Additional responsive and accessibility rules
- More viewport/device coverage
- Visual comparison
- Reports and exports
- Browser extension
- Team collaboration
- Billing and usage plans
- Human-assisted UI Fix Service

The roadmap should change when real product evidence suggests a different priority.
