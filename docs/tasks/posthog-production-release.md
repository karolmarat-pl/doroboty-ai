# Consolidated PostHog production release

## Intent and acceptance criteria

The owner explicitly authorized publishing all changes from this conversation to production, including the required branch integration, PR, merge and deployment. This supersedes the local-only release boundary recorded in the preceding task.

- Work from `codex/posthog-pageviews-unmasked-replay` and integrate current `origin/main` without losing product flows.
- Use one origin-gated, memory-only PostHog client. Retain main's safe business-event instrumentation through that client, while preserving the conversation's pageviews, unmasked replay and restricted autocapture. Do not restore persona identification, raw exception/log collection or mandatory local environment variables from the wizard initializer.
- Keep the existing production domain/site, scenario persistence and synthetic-data contract. No change to visitor access or storage schemas.
- Review the combined diff separately, execute the available verification gate and browser journeys, then create a reviewable PR and merge only after required checks pass.
- Observe the Git-linked production deployment and verify its source revision and HTTPS responses. Exercise real production pageviews, autocapture, test delivery and a short synthetic replay in an isolated browser context, then confirm ingestion and recording data in project 349566.
- Record actual evidence, limits and release identifiers. Do not claim human acceptance or full privacy/accessibility certification from automated checks.

## Integration review before merging main

`origin/main` at `e0b5201` contains a PostHog wizard initializer, direct SDK imports in business views, persona `identify/reset`, raw exception forwarding and optional log calls. The current branch uses a locally bundled recorder and exact-origin anonymous delivery. Running both initializers would split clients/configuration and could restore unwanted automatic capture and local setup errors. The integration will route the wizard's fixed business events through the shared client and its explicit property allowlist, retaining current runtime boundaries.

## Verification and deployment

Pre-publication checks passed formatting, immutable kit integrity and six examples, lint, types, 50 unit tests, baseline packet verification and the production build. The default browser phase could not launch missing Playwright `chromium_headless_shell-1243`; no browser/system installation was performed. The installed Chrome suite is used for local browser validation, and GitHub CI will provision/run its standard Chromium gate.

The real-SDK test now also verifies `candidate_profile_saved` delivery and absence of `$identify`. Its dev-server StrictMode context exposed the existing Web Lock acquisition race: scenario changes remain in memory and a save returns false, so a success event correctly is not emitted. Only this isolated analytics harness uses a deterministic single-tab Lock stub; the static-build contention, recovery, reload and import/export journeys continue using real browser locks. All four focused analytics journeys passed after that fixture isolation. No storage product code was changed to satisfy the test.

Separate integration review confirmed exactly one SDK initializer, no remaining direct runtime SDK imports, no legacy `VITE_PUBLIC_POSTHOG_*` guards, preserved business-operation order and nonblocking telemetry errors. The shared delivery filter accepts each existing main business-event name and strips unknown/malformed properties. Stages come from the owning domain list, including `hired`. Raw exception/log forwarding and persona identify/reset are intentionally excluded to preserve this chat's anonymous runtime boundary. The Polish disclosure and SYS-03 register describe business events and unmasked replay separately from restricted autocapture.

The final complete Chrome run passed all 51 browser journeys in 35.0 seconds. The previously published deployment `6af85a60d53c239d4c802e3b` was retained before release as 36 actual public files with SHA-256 hashes in the session visualization directory, `posthog-production-previous`. The candidate static build is retained separately as `posthog-production-candidate` with the release tool's manifest.

PR, CI, deployment and production smoke evidence will be recorded after execution.
