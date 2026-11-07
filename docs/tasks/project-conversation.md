# Project conversation prototype

## Intent and acceptance

Branch: `codex/project-conversation`. Add a synthetic project conversation to existing recruiting records without changing submitted application/CV snapshots, scores, stages or historical evidence.

- Employer selects at least one area: contribution, decisions, evaluation, limitations. Configuration snapshots the actual role description.
- Candidate (or explicitly labelled employer preview) answers a project-context question and selected area questions in a step-by-step conversation. Prepared answers and a prepared report demonstrate Marek Nowak / BrightLabs AI Product Manager only.
- The report explains selected areas relative to actual role requirements, includes verbatim source quotes with return-to-answer controls, unknowns and follow-up questions. No automated hiring recommendation, score or provider request.
- Any answer/configuration edit immediately invalidates the report, including after reload/export/import. Custom answers never receive the prepared interpretation. Restoring prepared answers requires confirmation before replacing content.
- Conversations persist in the existing validated local scenario and participate in reset/export/import; legacy v1 files remain importable. Role/company checks apply to operations and routes (simulation, not security).
- Reuse existing Button, Checkbox, Textarea, BackLink, RecordSheet and ConfirmDialog. Keep hash routes and human submission.

## Design mapping

New routes: employer `/#/app/kandydaci/:id/rozmowa`, candidate `/#/app/aplikacje/:id/rozmowa`. Entry links compose existing application records. C01 actions, C02 labelled fields, C04 grouped choices, C13 return navigation, C19 status, C22 reading sections and host RecordSheet typography/surfaces. Step navigation and interview/result layouts are scoped host extensions; the source kit does not establish a conversational screen. Use existing paper/white/ink/pink, Geist Serif 400, 24px reading surfaces and responsive stacking. No shared token/primitive changes; immutable kit remains unchanged.

## Validation and review

Implemented with the shared local store and existing record entries. FEATURES.md adds EMP-11, CAN-19 and SYS-12 without reusing historical IDs.

### Executed validation

- Node 24; formatting, design-system integrity (67 unchanged files and six kit tests), lint, types, 32 unit tests, baseline packet (120 journeys) and static build passed. Build retains nonblocking upstream Zod annotation and bundle-size warnings.
- Attempted `./scripts/verify` via the bundled shell: the environment has no Bash (`/usr/bin/env: bash: No such file or directory`). Executed its `npm run check` gate directly instead; all checks before browser journeys passed. The default browser gate cannot launch because the required Playwright Chromium is not provisioned. No browser binaries or system tools were installed.
- Ran the complete 37 browser journeys successfully using already-installed Chrome with an ignored local config (`artifacts/project-conversation/playwright.local.config.ts`). This is an alternate-browser execution, not a green default Chromium gate. Corrected the existing PDF request assertion to distinguish Chrome's internal PDF viewer URLs from external requests; PDF bytes, links and downloads still pass their original assertions.
- Three new browser journeys cover role/company boundaries, area selection and zero-selection disabling, candidate completion, exact quote-to-answer focus, immediate and reload-persistent invalidation, custom-answer completion without an interpretation, no external requests/runtime errors, scoped Axe scans (zero violations), long answers and widths 1280/1101/1100/1099/851/850/849/701/700/699/601/600/599/390/320.
- Five new unit tests cover edit/configuration invalidation, exact source/role grounding, authorization, legacy import defaults, import round trips, duplicate/dangling references, incomplete completion and unchanged submitted snapshots.

### Separate review pass

Reviewed the complete domain transitions, schema, route controllers, report eligibility and scoped CSS after implementation. Report eligibility requires explicit completion, exact selected prepared answers and the prepared role snapshot; the UI also verifies the sample application identity. There is no stored interpretation that an edited answer can revive. Every answer write marks the conversation as draft. Role configuration snapshots the actual current job and invalidates completion. Existing application/CV/stage/score records are not mutated. A missing conversation leaves no empty candidate-record section.

Compared actual full-page setup, conversation and report captures on desktop/mobile with the source offer and catalog running on port 8952. Measurements match source reading surfaces: white, ink rgb(24,24,24), 24px radius, one 1px contour; Geist Serif 400 headings; Arial 14px/600 action text and pink rgb(255,144,232) primary action. The context margin stacks below the working sheet on narrow screens. Captures and measured values are in ignored `artifacts/project-conversation/`, including `visual-review.json`. Step navigation and conversation UI remain documented host extensions rather than claimed source variants.

Local preview is running at `http://127.0.0.1:3013/` (`npm run dev -- --port 3013`). Ports 3001/3002 were occupied; 3001 serves a different checkout, so it was not stopped. Verified the actual new route in this checkout on 3013. Preview: choose Karolina Wiśniewska, then Kandydaci → Marek Nowak → Przygotuj rozmowę. Select areas, load the prepared answers, advance through the questions and explicitly finish. The candidate persona can complete the same configured conversation from its own application.

No merge, publication, human acceptance or AI/research effectiveness is claimed. The default Bash/Chromium environment remains unprovisioned; the installed-Chrome run and individual successful gates are the validation evidence.
