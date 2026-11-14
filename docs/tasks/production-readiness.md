# Production readiness audit

## Intent

Assess the AIPH3 synthetic-data static prototype before selecting hosting. Create a Polish, offline `docs/production-readiness.html` using the production-readiness skill renderer. Keep preparation, deployment verification and real-use observation separate. No product repairs, dependency installation, publication, commits or pushes are authorized by this audit.

## Acceptance criteria

- Inspect project instructions, feature boundaries, build/test scripts, local configuration and the complete baseline checklist.
- Record source/configuration identity, actual checks, exclusions, unresolved requirements and owners in the report.
- Attempt `./scripts/verify`; report platform/tool limitations and execute understood equivalent checks where available.
- Validate the embedded schema and review report navigation, disclosures, evidence, narrow layout and print rendering where browser access permits.
- Review the diff independently before handoff; preserve unrelated changes.

## Scope and register review

The user confirmed an AIPH3 participant prototype with synthetic data, with no deployed address or selected host. Existing browser-local work may be lost without an export. Hosting, operational ownership, traffic/budget and recovery expectations still need decisions. FEATURES.md was reviewed; this documentation-only audit does not change application behavior and requires no register update. The report uses the skill's offline renderer and is not a new application screen.

## Evidence and handoff

The HTML is the sole durable checklist and contains actual results, limitations and next actions. Temporary assessment JSON and audit utilities stay outside the repository; ignored build/browser artifacts are not participant deliverables. This audit is not course approval, human visual acceptance, a deployment verification or a security certification.

The user additionally confirmed up to 30 participants, no paid hosting, personal ownership of reports/repair decisions, and interrupted exercises as the consequence of an outage. No recovery-time or export-frequency promise has been agreed. Add the renderer output to `.prettierignore` so general formatting does not rewrite its embedded state/font.

`./scripts/verify` could not start because Bash is not installed. The first `npm run check` passed formatting, reference integrity/examples, lint and types, then encountered a sandbox temporary-directory error in two unit suites. Repeating unit tests with an ignored, repository-local TEMP/TMP passed all 33 tests. Packet verification and the static build passed. Default Playwright failed at browser launch because its provisioned Chromium is absent; no browser was installed. All 37 existing journeys then passed using an ignored audit-only config pointing at installed Chrome, with local-server access outside the restrictive sandbox.

Additional isolated-browser checks restored a UI-exported 26,127-byte synthetic scenario into a fresh context and confirmed identical complete state after reload; an HTML event-handler payload remained plain text. A two-tab check reproduced silent last-writer-wins replacement and stale UI. The report records these results with exact source/configuration identities and separates missing recovery/operational decisions from successful technical checks. Dependency advisories were fetched through npm without modifying installed versions: 12 development-tool findings and zero production dependency findings. Pattern scanning found no matches in current tracked sources/build or locally reachable historical text/config/script blobs; this is a scoped check, not proof that arbitrary credentials cannot exist.
