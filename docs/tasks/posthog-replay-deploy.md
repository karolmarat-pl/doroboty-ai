# Protected analytics, replay and production deployment

## Intent and acceptance criteria

Add a public analytics test button, exclude private interactions from autocapture, enable masked session replay, and publish on the existing Netlify site authorized by the user.

- Reuse the configured EU project and exact production origin; local/participant builds remain offline.
- Exclude inputs, forms, editable regions, dialogs and private route content from autocapture. Block private route content, identity labels and embedded documents in replay; mask remaining text and attributes.
- Include the recorder in the installed SDK bundle; allow replay snapshots through the delivery filter and fetch required public remote configuration.
- Keep replay console/network bodies, canvas and iframe recording disabled. Preserve human editing and browser-local scenario data.
- Reuse Base UI controls and the Poster People panel/status composition for a test on the privacy page. Report attempted delivery honestly.
- Change hosting build variables only where a verified mismatch requires it. Preserve site ID, URL and visitor access.
- Run the gate, separately review privacy boundaries and record deployment evidence.

## Hosting configuration

Existing site: `e3c531f7-0288-43ee-86ac-55810d12a63e`, https://doroboty-ai-aiph3-prototype.netlify.app.

The existing Git deployment used `VITE_PUBLIC_POSTHOG_*`, while this branch consumes `VITE_POSTHOG_*`. Added production-context variables under Netlify Project configuration → Environment variables:

- `VITE_POSTHOG_PROJECT_TOKEN`: the existing public ingestion token from ignored `.env.local`.
- `VITE_POSTHOG_HOST`: `https://eu.i.posthog.com`.
- `VITE_POSTHOG_ALLOWED_ORIGIN`: `https://doroboty-ai-aiph3-prototype.netlify.app`.

Granular `builds` scopes were not applied by the Free-plan CLI; default scopes were required. All three production values were read back and verified without printing their values. Legacy variables, audience, domain, routing and build command were preserved. The connector returned 403 for writes; the user authorized Netlify CLI in the browser, after which CLI configuration/publication succeeded. The project has Git continuous deployment; a future main push can replace this manual deployment. No branch was merged or pushed.

PostHog project 349566 (`doroboty-ai`) has `session_recording_opt_in: true` following the authorized settings update. Autocapture is enabled remotely (`autocapture_opt_out: false`). An initial project-get read was rejected because it would return an unnecessary token; project discovery and the narrow settings update completed without that read.

## Verification and separate review

- `./scripts/verify` cannot launch directly on this Windows host (Access is denied); its `npm run check` equivalent passed formatting, kit integrity and six examples, lint, types, 44 units, baseline packet and build before browser launch failed due to missing provisioned Chromium.
- All 48 existing journeys passed in installed Chrome using an ignored task-specific config. Two focused analytics journeys then passed, including the new keyboard/offline test-button check at 1280px and 390px and the private persona-picker boundary.
- The added replay privacy regression and final delivery-filter fix passed all 12 analytics unit tests. Final build, lint, formatting and diff whitespace checks passed across the recorded commands. No browser or OS dependencies were installed; Netlify CLI was obtained from npm for deployment.
- Separate review checked the shared selector, route boundary including hash deep links, portal/dialog and embedded-document exclusions, identity labels, SDK initialization, snapshot transport and privacy disclosure. The SDK requires `properties.token` for ingestion: the initial live check exposed the allowlist dropping it, and the filter now explicitly retains the configured public ingestion token for both analytics and replay. Mock-only tests did not establish live delivery.
- Final production deploy: `6af85a60d53c239d4c802e3b`. Live root returned HTTP 200 and its index exactly matched final `dist/index.html`.
- The isolated production smoke test clicked Test PostHog, observed queued feedback, and received HTTP 200 from both `/i/v0/e/` and `/s/` twice. It used a normal Chrome user agent and hid the automation webdriver marker only inside its own browser context because the SDK rejects bots; production bot filtering remains enabled. The test did not read another person's data or prove manual playback/ingestion UI availability.
- Final static release retained outside the repository under the session visualization directory, `posthog-release-final`, release hash `90e0a3ab6a4e8927584ec0292b41daf505505a96db6fc1a3acd72d087e081d14` (36 files). Non-fatal Zod annotation and bundle-size warnings remain.

Remaining limits: replay intentionally masks all text and attributes, reducing visual fidelity. Private screens appear blocked. No human visual approval or complete replay privacy audit is claimed. Source changes remain uncommitted locally.
