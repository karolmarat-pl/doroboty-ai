# Protect browser-local work across tabs

## Approved scope

Prevent stale tabs from overwriting the scenario, show an actionable Polish conflict notice, and retain export of local work. No automatic merge or schema migration. Update SYS-09 and refresh the readiness audit after verification.

## Acceptance

- One tab owns the origin's writer lock; other tabs cannot persist actions, imports or resets.
- Recheck the exact stored snapshot before writes, including changes from older application tabs or browser storage clearing.
- Preserve the losing tab's local edits for export; never replace them automatically.
- After exporting and closing the other tab, a reload can resume from the saved scenario.
- Missing locking support fails closed for persistence while export remains available.
- Exercise two tabs, simultaneous saves, reset/import, lock release and storage failures; run the project gate and a separate review.

## UI mapping

Reuse the existing Notice host recipe (C19 polite status) and Base UI outline button (C01). Persistent conflicts need a durable notice instead of the reference's transient toast. Keep typography, wrapping and focus; no kit changes or new color roles.

## Implementation and review

Added an exclusive, lifetime Web Lock per origin plus exact pre-write storage snapshot checks and storage-event invalidation. Lock refusal/unsupported locking retains in-memory operations for export. Import/reset refuses replacement in a blocked tab. Persistence conflicts return false to avoid successful submission/save feedback. Extracted the existing download helper for the shell notice. No schema or storage-key change; close older application tabs before adopting the new version because older code does not participate in the writer protocol.

Separate review covered StrictMode cleanup, lock release, preservation of corrupt originals, stale import/reset, denied reads/writes and unsupported locking. No automatic merge or forced lock takeover is implemented. Export covers scenario edits submitted through the form actions; unfinished text still in a form must first be submitted to the local scenario.

## Actual verification

- Formatting, kit integrity (67 files), six kit tests, lint, types, 33 unit tests, baseline packet and production build passed.
- `./scripts/verify` could not launch because Bash is absent. The equivalent `npm run check` reached browser tests; all default launches failed because provisioned Playwright Chromium is absent. No tools were installed.
- All 41 browser journeys passed using installed Chrome and the ignored audit-only config, including four new cases: simultaneous tabs/export/lock release, external clearing, snapshot changes without events and missing Web Locks.
- The four conflict journeys were rerun after waiting for dialog exit and two layout frames before captures. Keyboard export and layouts at 1280/390/320 px were checked. Captures are under `artifacts/tab-conflict/`; the persistent notice remains a documented host extension.
- Fresh participant packaging verified 220 files, zero history/instructor/task paths. npm audit still reports 12 development-tool advisories and zero production advisories. These are separate from this repair.

The readiness report preserves the original audit and assesses this repaired version separately. Local results do not establish deployment, CI or human course approval.
