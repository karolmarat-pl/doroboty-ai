# Netlify project link and publication review

## Intent and acceptance criteria

Link this working directory to a dedicated empty Netlify project and inspect publication prerequisites. Preserve existing uncommitted product work. Do not publish or connect automatic Git deployments.

- Confirm the account, project identity and visitor access controls.
- Save the local project link and exclude it from Git.
- Run the available verification gate and record actual outcomes.
- Review existing readiness evidence and identify remaining release decisions.

## Register review

FEATURES.md was reviewed. Local hosting association does not change product behavior, so no register update is needed.

## Project

Team: karol-marat (Free). Project: doroboty-ai-aiph3-prototype.
Site ID: e3c531f7-0288-43ee-86ac-55810d12a63e.
Dashboard: https://app.netlify.com/projects/doroboty-ai-aiph3-prototype

The project was created empty. Its default visitor protection requires Netlify team login for all deploys. Participant access needs an explicit audience decision before release. No application deploy or Git continuous-deployment connection was created.

The local `.netlify/state.json` association is ignored by Git. A future build should use Node 24, `npm run build`, and publish only `dist/` (or the archived release `site/`). Hash routing requires no history fallback. The prototype needs no database, API keys or runtime environment variables.

## Publication prerequisites

1. Decide participant access: the current team-login protection prevents ordinary course participants from opening a deployment. Do not silently remove this protection.
2. Retain a release archive and manifest for the exact final build. Existing uncommitted product changes must be included intentionally; a Git-based build would not include them until committed and pushed.
3. Configure the eventual delivery path with the build and publish settings above. Local linking does not connect GitHub, schedule builds or publish files.
4. Verify HTTPS, hash deep links, local fonts/CVs, scenario persistence, application/decision workflow and export/import on the deployed address. Web Locks used by the store require a secure context. Browser state on localhost does not transfer to the Netlify origin; use export/import.
5. Complete the instructor/participant exercise in docs/RELEASE.md and record the release decision. Inspect actual hosting usage and free-plan limits before admitting the group; no current traffic evidence exists.

## Current inspection, 2026-11-14

The existing HTML readiness report is historical evidence, not a fresh verdict for this link. In particular its missing-support-contact finding is outdated: src/features/prototype/error-recovery.tsx now contains the confirmed mailto contact. No percentage from that report is claimed as current. The installed Python command could not execute, so the required Python renderer could not refresh the report; its existing bytes were preserved.

The static build contains 35 files (~15.9 MB), including synthetic PDFs and their public explanatory README. No source maps, TypeScript or environment files were found in dist. The README contains synthetic-data documentation, not instructor history. The main JS bundle is ~664 kB (218 kB gzip); the people illustration is ~1.51 MB. Optimizing these is a recommendation, not an observed failure of the agreed teaching workflow.

The first verification attempt could not execute ./scripts/verify on this Windows host. The equivalent npm run check passed formatting, kit checks, lint and types, then hit a sandbox temporary-directory failure. A retry uses repository-local TEMP/TMP and the already provisioned Playwright Chromium. No browser or package was installed.

The live npm audit --omit=dev completed successfully with zero reported production vulnerabilities after retrying outside the network-restricted sandbox. This does not assess development-tool vulnerabilities or certify security.

Separate review confirmed the saved site ID matches the API response, git check-ignore excludes .netlify/state.json, and git diff --check passes. Existing product changes were preserved. No commit, push, deployment or visitor-access change was made.

Final verification: the retry passed formatting, design-system integrity and six example tests, lint, type checking, all 33 unit tests, the 120-journey baseline check and the static build. The sandboxed browser stage could not reach its local server and was interrupted. After stopping that attempt (an overlapping retry initially encountered occupied port 3106), the standard browser suite ran outside the sandbox with the existing Chromium and passed all 47 tests in 1.2 minutes, exit 0. Thus all gate stages passed across the recorded commands, rather than one uninterrupted ./scripts/verify invocation. The new task document also passed Prettier. These are local checks, not deployment verification or human acceptance.
