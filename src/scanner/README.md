# Local scanner

This directory contains the reusable local browser analysis layer.

## Current contract

`scanPage(url, viewport) -> ScanResult`

The first measurement set is intentionally small and deterministic:

- viewport width and height
- document width and height
- horizontal overflow in pixels

The scanner currently runs only against controlled local/test pages. User-provided public URLs are intentionally deferred until the execution boundary defines URL validation, SSRF protection, resource limits, and browser sandboxing.
