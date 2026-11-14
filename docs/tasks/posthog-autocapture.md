# Enable PostHog autocapture

## Intent and acceptance criteria

The user explicitly requested enabling autocapture in the local application.

- Initialize the existing optional SDK at application startup on the configured HTTPS origin.
- Enable autocapture and allow its events through the delivery filter; retain the explicit person-picker event.
- Preserve memory-only identity, offline local builds, no replay, and no private free text. Mask DOM text/attributes and allow only structural element metadata in autocapture payloads.
- Update the privacy disclosure and SYS-03 behavior register. No layout or style changes; the design-system reference remains unchanged.
- Run the verification gate and separately review the diff. Local verification does not establish deployment or live ingestion.

## Validation and separate review

- Direct `./scripts/verify` could not launch on Windows (Access is denied). Its equivalent `npm run check` ran outside the sandbox to avoid the previously observed Vitest temporary-file issue.
- Formatting, immutable kit integrity and six kit tests, lint, types, all 44 unit tests, baseline packet verification and production build passed.
- All 48 browser journeys were blocked at browser launch by missing Playwright `chromium_headless_shell-1243`; no browser or OS dependencies were installed. Desktop/mobile, keyboard and live SDK delivery remain unverified.
- Build reported non-fatal Zod annotation and bundle-size warnings.
- Separate diff review checked startup initialization, concurrent SDK reuse, event filtering, retained origin gating, offline behavior and disclosure consistency. The new unit regression checks startup without a person-picker click and removal of private text/attributes from autocapture properties. The implementation masks labels as well as user text, so autocaptured controls are identified structurally rather than by their visible text.
- No publishing, merge, remote PostHog settings change or live ingestion verification was performed.

Reference: https://posthog.com/docs/libraries/js/config#configuring-autocapture
