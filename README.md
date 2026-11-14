# DoRoboty.ai — AIPH3 prototype

A frontend-only job marketplace for participants to extend and test. Built with React, TypeScript and Vite, using Base UI components. The required visual direction for new and changed screens is the accepted Poster People design system.

## Design system — start here for UI work

Read [project integration instructions](docs/design-system/README.md), [host implementation rules](docs/design-system/IMPLEMENTATION.md) and [application acceptance checklist](docs/design-system/VERIFICATION.md), then [design.md](docs/design-system/agent-kit/design.md), [component API](docs/design-system/agent-kit/components/API.md) and the relevant [human documentation](docs/design-system/agent-kit/reference/index.html). The complete 67-file kit is stored under docs/design-system/agent-kit, including reusable CSS/JS, component states, listing/offer examples, screenshots, Geist Serif with license and illustration. No other chat or global skill is required.

```sh
npm run design-system:check
npm run design-system:dev
```

With Node 24, the first command verifies the preserved kit and examples; the second serves a separate local preview at http://127.0.0.1:8952/. No kit installation is needed. The main app uses port 3001 as below.

Build UI from this system, adapting its anatomy and visual roles into the existing React/Base UI components and host tokens. Preserve application behavior and hash routing; do not replace product state with the standalone demo fixtures/controllers. The application has a host adaptation. For every UI task, compare the affected anatomy, type roles, state and keyboard behavior with the reference; passing kit checks alone does not establish visual acceptance. See the integration guide for exact reading order, assets, React mapping, responsive rules and verification. AGENTS.md and CLAUDE.md enforce the same direction.

## Run

Requirements: **Node.js 24 and npm**.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3001. No environment file, account, database or additional service is required. Package installation requires access to the npm registry.

Select Anna or Marek as a candidate, Karolina or Tomasz as an employer, or the instructor. Publish a job, apply, switch person and record the employer decision. Changes survive reload in this browser; settings provide export, import and reset. AI and scores simulate prepared scenarios. Use example CVs only.

## Optional analytics for the owner

Local and participant builds need no configuration and remain offline. To enable analytics and replay on one deployed HTTPS origin, copy .env.example to .env.local and set VITE_POSTHOG_PROJECT_TOKEN, VITE_POSTHOG_HOST (https://eu.i.posthog.com) and VITE_POSTHOG_ALLOWED_ORIGIN (the exact origin, without a trailing slash). Configure the same names in Netlify build variables for future hosted builds; NEXT_PUBLIC names do not apply to Vite. Rebuild and redeploy after changes. Vite embeds these values in the public bundle: use only a public ingestion token, never a personal API credential.

PostHog initializes on startup only on the configured production origin. HashRouter explicitly sends `$pageview` on initial entry and pathname changes, including back/forward, without StrictMode duplicates. Query/filter and section changes alone do not create pageviews. Automatic SDK pageviews remain off to avoid double counting. Pageviews use route templates (such as `/oferty/:slug`) without query values, record IDs or free text.

Public autocapture still excludes inputs, forms, editable regions, dialogs and private route content, and retains structural metadata only. At the owner's request, replay has no text/input/attribute masking or route/dialog blocking: rendered scenario text and entered synthetic answers can be transmitted to PostHog EU. Use synthetic data only. Console, network body, canvas and cross-origin iframe recording remain disabled. Native embedded PDF playback is not guaranteed by DOM replay. The recorder is bundled locally. Enable session replay in the matching PostHog project. Identity remains in memory without cookies or persistent profiles. The privacy page includes a Test PostHog button that queues analytics_test_clicked; browser blockers can still prevent delivery. Other origins, including localhost and deploy previews, remain offline. These changes affect future recordings only; previously masked text cannot be restored.

The business events previously added on main also use this shared client: job search/save/publication, profile save, application draft/submission/withdrawal, recruiting-stage changes and project-conversation start/completion. Their allowlist accepts only bounded synthetic record IDs, fixed stage names, booleans and counts. It drops free text and unknown properties. Persona selection does not identify a person in PostHog, and failed telemetry does not block scenario operations. The earlier wizard initializer and direct SDK imports have been replaced.

## Build and verify

```sh
npm run build
npm run preview
./scripts/verify
```

The static output is dist/. Browser checks require an already provisioned Playwright Chromium; starting the app never installs it. See [participant guide](docs/PARTICIPANT_GUIDE.md), [architecture](docs/architecture.md), [current features](FEATURES.md) and [case protocol](docs/case/CASE_PROTOCOL.md).

To distribute a baseline participant package, run npm run package:participant -- /absolute/output/directory. This excludes Git history and instructor source material. Never distribute this repository’s history as a stage-safe packet.
