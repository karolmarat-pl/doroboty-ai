# Unexpected error recovery

## Approved intent and acceptance

Catch unexpected React rendering failures, display a Polish recovery screen, allow download of a minimal diagnostic report, and reload without clearing browser data. Never include user text, error messages, stacks, URLs, or scenario content in diagnostics. Preserve the existing saved scenario byte-for-byte. Cover a controlled render failure and recovery in a browser test, then run the project gate and regression journeys.

## Design mapping

Use the documented host prototype-panel surface and Base UI C01 actions, with C17 contextual recovery anatomy: heading, explanation and next action. This is a host extension for runtime errors, not a claimed reference variant. Preserve local typography and tokens; do not edit the kit. A global asynchronous error listener is outside this scoped React-render recovery implementation.

## Verification and separate review

The root boundary catches render/lifecycle failures. React's default caught-error console output is suppressed so raw error text cannot bypass the diagnostic allowlist. The controlled browser failure confirms the exact three report fields, absence of the injected private error text in the report and console, keyboard download, layouts at 320/390/1280 px, and byte-identical saved state before and after restart. Desktop and mobile screenshots were visually reviewed. FEATURES.md records SYS-13.

On 2026-11-14, formatting, lint, types, all 33 unit tests, the immutable 67-file design kit and its 6 example tests, the 120-journey baseline verifier, and the static build passed. All 42 browser tests passed in installed Chrome (46.1 s) using the ignored audit config. The standard gate remains limited by missing Bash for ./scripts/verify and missing default Playwright Chromium; no tools were installed. Build warnings concern dependency annotations and the existing large bundle.

A separate source review checked the diagnostic allowlist, root integration, saved-data preservation and scope boundaries. This does not catch asynchronous/event-handler failures, send reports remotely, recover unsaved form text, or prove deployment readiness. Earlier readiness evidence not repeated by this repair must remain stale in the refreshed checklist.
