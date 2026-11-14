# Pageviews and unmasked replay

## Intent and acceptance criteria

Work on `codex/posthog-pageviews-unmasked-replay`, preserving the existing uncommitted analytics/replay work. Enable pageview delivery and remove replay text/input/attribute masking and route/dialog blocking, as explicitly requested by the owner. Leave autocapture behavior unchanged.

- Record the initial hash-router view and subsequent pathname changes, including back/forward, without StrictMode duplicates. Search/filter and section changes alone do not create pageviews.
- Allow `$pageview` through the outbound filter. Send a stable route template without search values, section hashes, record identifiers or free text.
- Replay shows rendered text, attributes, inputs, private-in-the-UI scenario screens and dialogs. Do not reuse the autocapture exclusion selector in replay. Keep console, network bodies, canvas and cross-origin iframe collection disabled; these are separate collection channels, not text masking.
- Preserve exact production-origin gating, anonymous memory-only identity, offline local/participant operation and existing autocapture exclusions/property filtering.
- Correct the Polish privacy disclosure and engineering documentation. Existing C01/C19/C22/Base UI composition stays in place; no style/token/reference-kit change is needed.
- Run `./scripts/verify`, report actual failures, and perform a separate review. Browser regressions must exercise real SDK pageview delivery and replay snapshots with synthetic content, as well as local offline behavior.
- Do not publish, merge or create a PR as part of this local branch change. Explain the existing deployment and the Git/Netlify release path.

## Starting state and release boundary

The live production deployment is `6af85a60d53c239d4c802e3b`, published November 14, 2026 at 12:56 UTC. Its index and entry JavaScript matched the existing local `dist` during the preceding inspection. Source work for masked replay/autocapture was still uncommitted and is retained on this new branch.

`origin/main` is `e0b5201`, with a separate PostHog wizard integration. This branch descends from `9704cfd`; neither ancestry alone nor a local build establishes that it contains remote main. A future PR must reconcile the two integrations without restoring duplicate initialization, mandatory local analytics variables or unrelated event collection.

## Implementation

Shell reports pathname changes to `trackPageview`; the initial view follows the same path. SDK automatic pageviews deliberately stay off because HashRouter reports views explicitly. The last reported pathname suppresses StrictMode duplicate effects, while returning from another pathname counts again. Query and section changes alone do not call the tracker. The delivery filter now permits `$pageview` and preserves a normalized route template and session/window linkage.

Replay has explicit unmasked text/input/attribute configuration and no application route or dialog selector. The private analytics markers and structural autocapture filter remain in place for autocapture only. The privacy page states that rendered synthetic data and entered text can reach PostHog through replay. Existing typography, Button, status and outlined surface recipes are reused; the immutable reference kit and host styles are unchanged.

The browser gate now also serves the existing application with a synthetic analytics configuration on loopback port 3107. Browser requests to `analytics.example` are routed there; ingestion and the EU assets configuration endpoint are intercepted. These tests exercise the real installed SDK, including its batch envelopes and transport/snapshot compression, without sending test replay data to PostHog.

## Validation and separate review

- `./scripts/verify` was attempted and could not start on Windows: Access is denied. Its `npm run check` equivalent first encountered a sandbox-only Vitest temporary-file ENOENT; running the gate outside the sandbox resolved that environment failure.
- The gate passed formatting, all 67 immutable reference hashes, six kit examples, lint, types, 48 unit tests, the 120-journey baseline packet and the production build. The default browser phase could not launch its missing `chromium_headless_shell-1243`; no browser binaries or OS dependencies were installed.
- Browser validation uses installed Chrome through the ignored `artifacts/posthog-pageviews/chrome.config.ts`, with the same test suite and servers. Initial real-SDK test failures exposed test-harness issues: the SDK's separate EU-assets config endpoint and batch envelopes were not initially intercepted/decoded, and internally compressed replay mutations needed decoding. These were corrected in tests rather than bypassing application behavior. The focused run passed all four analytics journeys, including initial/navigation/history pageviews, no StrictMode duplicates, readable synthetic form/private-screen/dialog snapshots and unchanged form autocapture exclusion. The final complete Chrome run passed all 51 browser journeys in 37.2 seconds after the final build.
- Final build passed; Zod annotation and chunk-size warnings are non-fatal. Final formatting, lint, types and whitespace checks passed across the recorded commands.
- Inspected full privacy-page captures at 1280, 390 and 320 pixels: the changed disclosure wraps, the existing serif heading/body/action roles and outlined panel are preserved, and the test action remains usable. The served immutable catalog was available on port 8952. The synthetic HTTPS interception context displays the existing storage-lock recovery notice and exercises scenario edits in memory; it does not establish production storage behavior. Standard browser journeys cover persistence separately.
- Read-only production SDK configuration inspection returned HTTP 200 with `masking: null`, an empty recording URL blocklist and `autocapture_opt_out: false`. No remote settings were modified. A preliminary flags endpoint request was not used as evidence of replay configuration; the actual SDK assets-config endpoint was checked instead.
- Separate review checked the actual router path list against normalization, StrictMode/concurrent initialization, back/forward counting, outbound `$pageview` permission, preserved ingestion token/session identifiers, snapshot preservation, explicit replay masks/blocking removal, unchanged autocapture selector/filter, exact-origin gating, the Polish disclosure and documentation. Alert dialogs are not universally excluded by the existing `[role="dialog"]` autocapture selector; the disclosure avoids claiming that every portal dialog is excluded. Autocapture was not broadened or narrowed in this change.

Production still serves the previously published version. No new live ingestion, playback, CI, publication or human approval is claimed for this branch.
