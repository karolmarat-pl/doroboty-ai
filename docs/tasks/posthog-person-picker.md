# PostHog person-picker click delivery

## Intent and acceptance criteria

Connect the published AIPH3 prototype to the user's PostHog EU project and allow the owner to see the header's "Wybierz osobę" click in Activity.

- Use optional Vite build variables; the default/local/participant build remains offline.
- Enable delivery only on the configured production origin.
- Capture only `person_picker_clicked` from the header link. No free text, scenario/person IDs, raw URLs, form inputs, errors, autocapture or replay.
- Use memory-only anonymous identity and suppress person profiles; analytics failure must not block navigation.
- Document the changed behavior and configuration, execute the repository verification gate, and perform a separate review.
- Archive and publish only the tested static build at the existing address; verify a real browser click reaches the intended PostHog project. Keep automation smoke events distinguishable from the owner's later click.

## Implementation decisions

The repository uses Vite, not Next.js, so NEXT_PUBLIC variables are not consumed. Use VITE_POSTHOG_PROJECT_TOKEN, VITE_POSTHOG_HOST and VITE_POSTHOG_ALLOWED_ORIGIN. The supplied project token is a public ingestion token, never a personal API credential. Real configuration remains outside tracked source.

The explicit user request to make a click visible on the published site authorizes this narrow analytics connection. Existing synthetic-data, human editing and role-simulation boundaries remain in force. SDK guidance about broad tracking/identification is superseded by this scope and the project's prohibition on sending private text.

No screen layout, styling, or UI wording changes are planned; the design-system register is reviewed and the immutable kit remains unchanged.

## Validation and deployment

- The current request is to open a pull request; deployment and live event delivery were not performed.
- Direct ./scripts/verify invocation could not start on Windows (Access is denied); its equivalent npm run check was executed. The first sandboxed attempt hit a Vitest temporary-file ENOENT. A repeat outside the sandbox passed formatting, design-system integrity and six kit tests, lint, types, all 43 unit tests, baseline packet verification and production build.
- Browser validation is blocked: Playwright cannot find chromium_headless_shell-1243. No browser or OS dependencies were installed. Desktop/mobile, keyboard and recovery journeys are not verified by this run.
- Build emitted non-fatal Zod annotation and chunk-size warnings. Local checks do not establish CI or production delivery.

## Separate PR review — 2026-11-14

Reviewed the change against its local parent and fetched origin/main. The ignored .env.local is excluded; .env.example contains no project token. The implementation gates SDK initialization by exact HTTPS origin, catches failures and allowlists event properties. Existing UI composition is preserved; privacy disclosure is conditional.

Merge blocker: origin/main at e0b5201 already includes PR #2, a separate PostHog wizard integration using VITE_PUBLIC_POSTHOG variables, global SDK initialization, profile identification and additional event/error capture. These local changes were prepared from cca6575 and do not reconcile that implementation. Its development startup throws without VITE_PUBLIC_POSTHOG settings, and its broader collection contradicts this branch's single-event documentation. Open this change as a draft, preserve both histories, and resolve the intended analytics scope before merging. Passing tests on this branch would not validate the combined result.
