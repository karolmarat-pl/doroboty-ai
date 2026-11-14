# Static prototype release runbook

## Scope and responsibilities

Synthetic-data AIPH3 exercise, at most 30 participants, free static hosting. Karol owns release decisions and receives reports at karolmarat@gmail.com. No real authentication, shared database, paid service, automatic email or remote telemetry is required. Hosting selection and account access must be recorded before publishing. Do not treat a local test as a deployed-site check or participant approval.

## Prepare and retain a release

1. Use Node 24 and npm. In a fresh participant package, run `npm ci`. Run `npm exec playwright install chromium` only with explicit permission to download the required browser. Do not install OS dependencies automatically. If using a custom `PLAYWRIGHT_BROWSERS_PATH`, use the same absolute path for installation and tests.
2. Run `npm run check`. It is the same gate invoked by `./scripts/verify` on systems with Bash. Windows does not need a Bash installation to run `npm run check`. A successful build alone is not a passed gate.
3. Run `npm run package:release -- <absolute empty directory outside this repository>`. It archives the current dist as site/ and records every file hash and a content-derived release ID in release-manifest.json. It never overwrites an existing release. Keep the manifest alongside the release, outside the published directory.
4. Retain the last known-good release before any update. Record source commit/working-tree identity, release ID, test date and operator in your release notes. Publish only site/, never the repository or participant source package. The latter includes teaching documentation and is a separate distribution.
5. Do not change the public address during an update. Browser saves belong to that address. Ask participants to export before updating and close old tabs before reopening the new version.

## Smoke check immediately after publishing

Karol runs these checks with synthetic data on the exact HTTPS address, before admitting the group. An agent may assist, but record who actually checked it.

1. Open the homepage and a copied hash offer link in a fresh browser context. Confirm local fonts/illustrations and a prepared PDF CV load.
2. Choose Anna, edit a profile, save it and reload. Confirm the change survives.
3. Submit a synthetic application with approved answers. Switch to the matching employer and record a decision. Return to the candidate and reload to confirm the state.
4. Export the scenario. Import it into an isolated browser context and compare the last completed step; never replace a participant's only copy for a test.
5. On mobile, check the same core flow, navigation, keyboard focus and recovery actions. Confirm the error-report contact is available and that no real data was used.
6. Record date, URL, release ID, browser and outcome. If the app fails to load, the main flow fails, or saved data disappears/changes unexpectedly, stop admission and roll back. Cosmetic issues may be recorded separately for Karol's decision; do not hide critical failures.

## Backup policy agreed by the owner

Each participant exports JSON after every major stage and before an update, and stores it on their computer until the exercise ends. Work since the last export may be lost. This is a learning exercise: an outage pauses the exercise; there is no guaranteed repair time. Email Karol rather than repeatedly resetting. Never enter real personal data.

## Restore a scenario

1. Preserve the current export or the original unreadable save offered by Settings. Do not clear site data.
2. Try the last exported JSON in a separate browser context first. Select a persona, open Settings, import and confirm replacement of that disposable context only.
3. Confirm identity, last edited content, applications and decisions; reload and check persistence. Retain the original file unchanged.
4. Once verified, the participant can choose to import into their normal browser. A rollback of application code is not restoration of a scenario.

## Roll back a release

1. Stop the exercise and notify participants through the established course channel or reply to their email. Ask them to keep tabs/data and any exports; do not reset.
2. Select the archived last known-good release and verify its files against release-manifest.json. Restore the entire site/ as one release at the same address using the chosen provider's version/atomic deployment mechanism. Do not mix assets from different builds.
3. Repeat the smoke checks. Open a synthetic version-1 save and confirm it is preserved. If a future release changes the storage schema, rehearse backward compatibility before deployment; do not assume it.
4. If rollback does not restore the main flow, keep the exercise paused and investigate in an isolated context. Recover data from export only after preserving the existing save.
5. Record the failed and restored release IDs and result. Provider-specific access, steps and the actual deployed rollback remain to be verified after a host is selected.

## Human acceptance

Before the group starts, Karol/instructor and one participant complete a short real exercise on synthetic data: find an offer, apply, review the application, record a decision, export and restore. Record the date, tested version, observed difficulties and decision to share. Automated tests and an agent's walkthrough cannot substitute for this human confirmation.
