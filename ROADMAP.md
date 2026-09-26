# Visibilio Roadmap

> Canonical implementation status lives in [PRODUCT_PROGRAM.md](./PRODUCT_PROGRAM.md).

The roadmap is milestone-driven. Each milestone should produce a small, testable increment.

## M0 — Foundation
- [x] React + TypeScript + Vite
- [x] Tailwind CSS
- [x] Linting and formatting
- [x] Application shell
- [x] CI foundation

**Exit criteria:** The app installs, runs locally, builds successfully, and CI covers the main checks.

## M1 — Deterministic Audit Engine
- [x] Playwright runner
- [x] Initial viewport presets
- [x] Document/viewport dimensions
- [x] Horizontal overflow detection
- [x] Rendered element overflow detection
- [x] Missing image alt detection
- [x] Missing form-control accessible name detection
- [x] Missing document language detection
- [x] Selector and measurement evidence
- [x] Regression coverage

**Exit criteria:** Controlled page scans produce reproducible, evidence-backed findings.

## M2 — Product Shell + Findings
- [x] Website as the primary product object
- [x] Overview / Analyze / Findings / History / Settings
- [x] Site-scoped scan history
- [x] Finding detail and filters
- [x] Screenshot capture
- [x] Session-scoped screenshot artifact identity
- [x] Screenshot binary serving
- [x] Focused evidence viewer
- [x] Retry and cancellation
- [x] Retest lineage and before/after comparison

**Exit criteria:** A user can scan a controlled website, inspect evidence, retest a finding, and see the result.

## M3 — Persistence + AI Explanation
- [x] Website and ScanSession repository contracts
- [x] In-memory storage boundary
- [x] PostgreSQL persistence adapter
- [x] Explicit database migration command
- [x] AI explanation input/output contract
- [x] Deterministic fallback explanation
- [x] HTTP explanation provider adapter
- [x] Provider validation and retries
- [x] Finding explanation UI

**Exit criteria:** Scan history has a durable storage boundary and findings can receive clearly separated explanations.

## M4 — Scan Execution Boundary
- [x] HTTP/HTTPS validation
- [x] Credential rejection
- [x] Initial hostname/IP SSRF filtering
- [x] Request body limit
- [x] Scan timeout
- [x] Request-count budget
- [x] Response-byte budget
- [x] Redirect/navigation SSRF controls
- [ ] DNS rebinding-safe enforcement
- [ ] Browser isolation/sandbox strategy
- [ ] Queue/worker job lifecycle
- [ ] Rate limiting and abuse controls
- [ ] Observability
- [ ] Production deployment validation

**Exit criteria:** Public URL scanning is enabled only after network, browser-isolation, queue, and abuse controls are verified.

## M5 — Suggested Fixes
- [ ] Likely causes grounded in evidence
- [ ] Implementation directions
- [ ] Optional code examples
- [ ] Explicit suggestion labeling
- [ ] Uncertainty and safety boundaries
- [ ] Finding-specific fix guidance

**Exit criteria:** Users can move from a finding to a practical next step without confusing suggestions with measured facts.

## M6 — Repeat-Use Intelligence
- [x] Site-scoped history
- [x] New-finding detection
- [x] Resolved-finding detection
- [x] History movement summary
- [ ] Overview health movement
- [ ] Persistent screenshot/object storage
- [ ] Retest history surface
- [ ] Cross-scan trend view

**Exit criteria:** Users can understand how a website changes across repeated scans.

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
- [x] Landing navigation hardening
- [x] Landing localization
- [x] Keyboard focus visibility
- [x] Sticky-header anchor offsets
- [x] Reduced-motion handling
- [x] Landing feature-step semantics
- [x] Landing evidence/re-test copy consistency
- [x] Landing product proof pass
- [x] Core landing responsive rules
- [ ] Full device/browser validation
- [ ] Loading/error recovery polish
- [ ] Density and whitespace review from real-user feedback
- [ ] Evidence interaction polish
- [ ] Product-shell mobile interaction polish

**Exit criteria:** The landing page and product shell demonstrate the same evidence-first quality bar across validated target devices.

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