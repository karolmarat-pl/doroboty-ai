# Runtime error recovery

## Intent and acceptance

Extend SYS-13 to uncaught window runtime errors and unhandled promise rejections. Reuse the existing Poster People recovery panel and Base UI actions without modifying kit styles. Preserve persisted scenario bytes; explain that unsaved work may be lost. Keep diagnostics restricted to code, time and random reference, suppress raw browser reporting for handled global events, and retain only the first incident. Clean up listeners on unmount, including StrictMode remounts. Move keyboard focus to the recovery heading. Handle diagnostic download failure without an error loop. Do not intercept resource-load errors or add external telemetry.

Verify actual throwing click/timer callbacks and rejected promises in browser tests, report privacy, repeated incidents, reload recovery and download failure. Recheck the project gate and current readiness evidence. The user confirmed karolmarat@gmail.com for manual reports; expose it in the recovery screen and participant guide. Record first response steps in SECURITY.md. Sending email is not part of this implementation.

## Verification and separate review

The five focused browser tests passed in installed Chrome: real click/timer exceptions, an unhandled rejected promise, report-download failure and render recovery. They assert report field allowlisting, suppression of injected private text, first-incident stability, keyboard focus and byte-identical saved data after reload. The 320px download-failure and 1280px recovery screenshots were visually reviewed; the existing 390/320px checks also ran. No kit or layout tokens changed.

The standard npm run check passed formatting, 67-file kit integrity and 6 examples, lint, types, 33 unit tests, the 120-journey baseline and build. Its browser stage cannot launch the missing default Playwright Chromium. ./scripts/verify also cannot start because Bash is absent. These are tooling limitations, not passing standard-gate results. No tools were installed.

Separate review checked listener cleanup, first-incident handling, exclusion of raw event/rejection content, mailto-only contact, recovery without storage mutation and explicit failure-to-download feedback. Pre-bootstrap failures, resource-load failures, cross-origin errors unavailable to the browser, remote monitoring and hosting access remain outside this mechanism. No message was sent and no site was deployed.

Full regression: 46/46 browser tests passed in installed Chrome (44.3 s). Dependency reassessment still reports 12 development-tool findings and zero production findings. Participant packaging/pristine verification passed with 222 files and no forbidden paths. The scoped secret scan found no matches in 320 current source/build files and 1057 historical blobs across 73 commits.
