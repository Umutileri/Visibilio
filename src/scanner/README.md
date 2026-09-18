# Local scanner

This directory contains the reusable local browser analysis layer.

## Current contract

```ts
scanPage(url, viewport) -> ScanResult
```

The first measurement set is intentionally small and deterministic:

- viewport width and height
- document width and height
- horizontal overflow in pixels

The scanner uses controlled local/test pages during M1. User-provided public URLs are intentionally deferred to M8, where URL validation, SSRF protection, resource limits, and sandboxing are defined.
