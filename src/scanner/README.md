# Local scanner

This directory contains the reusable browser analysis layer used by Visibilio.

## Current contract

`scanPage(url, viewport, options?) -> ScanResult`

The scanner uses Playwright and produces deterministic, evidence-backed results. The current rule set includes:

- viewport width and height
- document width and height
- horizontal overflow
- rendered element overflow
- images without an `alt` attribute
- form controls without an accessible name
- documents without a `lang` attribute
- selector and measurement evidence where available
- screenshot evidence for successful scans

## Execution guardrails

`ScanOptions` can enforce:

- maximum scan duration
- maximum request count
- maximum aggregate response bytes
- a navigation guard for URL/redirect policy
- an evidence output directory

The current defaults are intentionally conservative:

- 15 seconds maximum scan budget
- 150 requests
- 8 MiB aggregate response-body budget

Budget breaches are returned as the typed `RESOURCE_LIMIT` scanner failure.

## Public scanning boundary

The scanner is reusable by the server API, but arbitrary public URL scanning is still gated. Before production/public scanning is enabled, the execution boundary must also provide:

- redirect and navigation SSRF enforcement
- DNS rebinding-safe destination validation
- browser isolation/sandboxing
- queued job lifecycle and cancellation
- rate limiting and abuse controls
- persistent screenshot/object storage
- observability and production deployment validation

The scanner should remain independently testable and deterministic as these execution controls evolve.
