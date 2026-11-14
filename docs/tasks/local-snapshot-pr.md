# Preserve local project work in a pull request

## Intent and acceptance criteria

Preserve all current nonignored project changes on a new branch and open a GitHub pull request against main. Include the existing project-conversation commit that is not on main. Exclude dependencies, builds, browser artifacts, environment files and the ignored local Netlify association. Do not merge or deploy.

- Inspect the diff and new files before committing.
- Attempt scripts/verify and run its npm run check body when the Windows host cannot launch it.
- Record actual validation and a separate review before pushing.
- Keep FEATURES.md updates already supplied with the product changes; this snapshot operation adds no product behavior.

## Review

Reviewed recovery diagnostics, browser writer locking, restore coverage, release packaging, participant boundaries and the existing task evidence. Diagnostics contain only allowlisted metadata; exports remain local and email is manual. No credential patterns were found in the changed text sources. Ignored artifacts and Netlify state are excluded. The readiness HTML retains historical findings and must not be treated as a fresh deployment verdict. No merge, publication or human acceptance is implied.

## Actual validation (2026-11-14)

The direct ./scripts/verify invocation could not launch on this Windows host. Its npm run check body passed formatting, immutable kit integrity and six example tests, lint, types, 33 unit tests, the baseline packet check and static build. The sandboxed browser stage could not reach its local server and was interrupted. Repeating the standard npm run test:e2e outside the sandbox with the existing Playwright Chromium passed all 47 journeys (1.3 minutes). No packages or browsers were installed. The new task note passed Prettier separately. Git whitespace review allows CRLF in the preserved generated readiness HTML; no renderer output was reformatted. These are local checks, not remote CI or deployment verification.
