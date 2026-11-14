# Participant guide

## Start

Use the prepared baseline package and Node.js 24 with npm.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3001. If Node or registry access is blocked by your organization, ask your instructor/IT rather than bypassing the policy.

## Try a complete flow

1. Choose Anna Kowalska and browse offers.
2. Save an offer, edit the profile and submit an approved application. Source notes and the editable proposal are separate.
3. Choose Karolina Wiśniewska for BrightLabs and review its candidates.
4. Record review, invitation, conversation and the next decision.
5. Return to Anna and inspect the application history.

Karolina and Tomasz see their respective companies in the interface; this is role simulation. All data is local and synthetic. CVs are prepared text examples, not real uploads. AI proposals and scores simulate the scenario.

## Save, share and recover

Changes survive reload in this browser. Settings can export a JSON file, import a scenario or reset to fixtures. Import/reset asks before replacing state. If a save is incompatible, download the original before resetting. Storage failure is shown explicitly; export before closing the tab. Use one editing tab at a time.

A URL shares the interface, not your local changes. To transfer a scenario, share the exported file and import it in the other browser. Exports include all personas, applications and notes; never enter real personal data.

Export after each major exercise stage and before an update. Keep the JSON on your own computer until the exercise is finished. Work since the last export may be lost. If the exercise breaks, stop and contact Karol by email; do not reset or clear site data. To restore, first preserve any existing save, then import the exported file in Settings and check your last completed step. Changing the website address does not move browser data; export before switching addresses.

## Report an unexpected error

On the recovery screen, download the diagnostic JSON and email it manually to karolmarat@gmail.com with the action you were attempting. The report contains only a category code, timestamp and random reference, not your scenario. If download fails, copy the displayed code/reference. If the page cannot start at all, email the same address with the time and symptoms; the in-app recovery screen requires the app to have loaded.

Restart keeps saved browser data, but unsaved form text may be lost. Do not clear site data or reset the scenario while reporting a problem. Use synthetic examples only and do not attach the full scenario unless explicitly needed for diagnosis. No automatic report is sent.

## Static build

Run npm run build. Serve dist/ through any static HTTP host. No provider account is needed for local development. Do not open index.html via file://; ES modules need HTTP. Hash links work without route rewrite configuration.

## Verification

Run ./scripts/verify or npm run check. Browser tests require provisioned Playwright Chromium; a missing test browser does not prevent npm run dev. Do not let an agent install system dependencies automatically.
