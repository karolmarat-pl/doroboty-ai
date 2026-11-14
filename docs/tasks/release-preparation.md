# Release preparation

## Intent and acceptance

Complete the locally actionable readiness requirements for a synthetic-data AIPH3 static prototype used by up to 30 participants. Provision the project-required Playwright Chromium without installing OS dependencies, verify a fresh npm ci and the standard gate, rehearse scenario restoration in an isolated browser and rollback of a saved static artifact, and document repeatable release, smoke checks and first response. Prepare hosting-specific configuration only after the user selects a provider. Do not publish or send messages.

Preserve previous audit history and reassess current sources with actual command results. Keep the report honest about missing hosting access, human acceptance and deployed checks. FEATURES.md must distinguish local tooling/procedures from application behavior; no UI redesign is in scope.

## Results and separate review

On 2026-11-14 the user explicitly authorized downloading Playwright Chromium after the automatic approval reviewer rejected the initial attempt. Chromium/headless shell v1243 and Playwright's helper binaries were downloaded into artifacts/playwright-browsers; no OS dependencies were installed. The user accepted exports after each major stage and before updates, participant-held copies, and pausing the exercise on failure with email contact.

A fresh participant package received npm ci (415 packages, exit 0). After correcting formatting in the new restore test, the standard npm run check passed: formatting, immutable kit integrity and six example tests, lint, types, 33 unit tests, baseline 120, static build and all 47 tests in Playwright Chromium 153.0.8010.12 (1.8 minutes). CI=1 selected the project's two-worker configuration, without replacing the browser project. TEMP/TMP and PLAYWRIGHT_BROWSERS_PATH pointed to the audited repository artifact directories. The installed Chrome override was not used. ./scripts/verify still requires unavailable Bash, but its complete npm run check body passed on Windows; this is not evidence of remote CI.

The new restore test downloaded a modified synthetic scenario through the UI, imported it in a distinct browser context, compared the entire state after reload and checked the source context was unchanged.

The release archive contains 35 static files, identified by SHA-256 manifest release ea0cd07b250a6f752d26f48ba8907f8ad977456936d56c57449d937fcc474a8f. In an isolated same-origin server at 127.0.0.1:3124, a deliberately broken index was observed, then replaced by the archived complete site. Every restored file hash matched and the saved scenario remained byte-identical. The archive was not changed. Invalid in-repository output and nonempty output requests were correctly rejected. This is a local rollback rehearsal, not a provider rollback test.

At 390px, four-times CPU slowdown, 150ms network latency and 1.5Mbps download emulation, profile editing/save/reload succeeded; the whole measured exercise took 10.58 seconds. This is one emulated trial, not a real-device or 30-person load test. Static hosting capacity/limits remain provider-dependent.

Separate review checked package boundaries, manifest hashing, preservation of existing releases, no source maps/dotfiles/symlinks, the restore assertions, scenario version-1 compatibility, and distinctions between source package, static release and browser data. No app screen changed. The runbook names Karol as smoke operator and specifies stop/rollback conditions. No publication, email, human exercise or hosting access check was performed. Provider selection and human acceptance remain external prerequisites; the refreshed report must show them as open.
