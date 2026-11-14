# Local PostHog environment entries

Intent: configure the ignored .env.local file with the user-provided public PostHog ingestion settings while preserving unrelated configuration.

Acceptance: VITE_POSTHOG_PROJECT_TOKEN, VITE_POSTHOG_HOST and VITE_POSTHOG_ALLOWED_ORIGIN are present; obsolete token/host aliases are removed; the file remains excluded from Git.

The allowed origin is https://doroboty-ai-aiph3-prototype.netlify.app without a trailing slash. Configuration values were verified after writing. This local file does not configure Netlify build variables or deploy the application. FEATURES.md SYS-03 was reviewed; configuration alone needs no register update.

The required ./scripts/verify invocation could not start on Windows (Access is denied). PR validation uses its equivalent npm run check gate; results are recorded in posthog-person-picker.md. No live event delivery is claimed.
