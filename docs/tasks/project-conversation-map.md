# Project map visual prototype

## Intent and acceptance

Continue the authorized work on `codex/project-conversation`, preserving the uncommitted first prototype. The user selected the third visual concept, “Mapa projektu”, from the comparative mockups in this chat. Adapt that composition into the working React application, not a separate static demonstration.

- Apply the poster-like heading, numbered project route, pink selection, source quote and adjacent role interpretation throughout setup, conversation and result.
- The route contains mandatory project context (“Problem”) and only recruiter-selected areas. It is a local navigation control, not a score or a claim that a recruiting stage has been completed.
- Recruiter report presents one selected area at a time. Keep actual role requirements, exact prepared answer quotes, unknowns, follow-up questions and direct source editing. Project context shows the prepared context quote without inventing another assessment.
- Keep candidate completion and source-only views, explicit sample replacement, editable answers, legacy imports and immediate interpretation invalidation. Preserve hash routes, company/person checks and submitted application/CV/score/history data.
- Reuse Base UI Button/Checkbox/Textarea and RecordSheet. A backward-compatible controlled section API lets the map select the explanation without remounting controls or losing keyboard focus.
- Keep the immutable Poster People kit and global tokens unchanged. Compose C01/C04/C13/C22 and existing host typography/surfaces; the map is a user-selected host extension. Preserve local Geist Serif 400, ink contours, paper/white surfaces, restrained pink and yellow illustration accents.
- Verify actual desktop/mobile/320px layouts, keyboard map selection and source focus, scope selection, edited/custom-answer suppression and reload. Update FEATURES.md and component documentation, run the project gate and complete a separate review.

## Validation and review

Implemented on the existing task branch. All three working phases now follow the chosen project-map direction. The report defaults to “Sprawdzenie” when selected, otherwise the first selected area, and includes mandatory project context. Candidate summary and current source answers remain available without the recruiter interpretation.

### Executed checks

- `npm run check`: formatting, immutable kit integrity (67 files/six kit tests), lint, types, 32 unit tests, baseline packet (120 journeys) and static build passed. The default browser phase failed to launch because its Playwright Chromium is not provisioned. No browser/OS tools were installed. Build retains the existing upstream Zod annotation and bundle-size warnings.
- Attempted `./scripts/verify` with the available bundled shell; the wrapper could not resolve `dirname`/Bash in this Windows environment. This is an environment limitation, not a successful wrapper run. Ran the equivalent npm checks directly and recorded the browser alternative explicitly.
- Final installed-Chrome run: all 37 browser journeys passed using the existing ignored `artifacts/project-conversation/playwright.local.config.ts`. This includes the original shared candidate/employer RecordSheet journeys after adding optional controlled sections.
- Expanded the three conversation journeys: selected-area count and omitted controls, keyboard Space selection with retained map focus, source-tab → map selection → explanation selection, context source, exact role requirement disclosure, quote-to-editor focus, candidate/company boundaries, immediate/reload-persistent suppression after editing, and no interpretation for custom answers. Scoped Axe scans report zero violations. No external requests or runtime errors were observed in the exercised conversation journey.
- Conversation layout checks cover 1280/1101/1100/1099/851/850/849/701/700/699/601/600/599/390/320px with a long answer. Report checks cover 1280/1100/851/850/849/601/600/599/390/320px and assert the actual navigation, quote, reading columns and document fit.
- Ran the reference catalog/offer on port 8952 and inspected the actual application on port 3013. Source and host reading surfaces measure white with ink rgb(24,24,24), a single 1px contour and 24px radius. Headings use local Geist Serif 400; primary controls are Arial 14px/600 with rgb(255,144,232) fill. Evidence is in ignored `artifacts/project-conversation-map/`, including source/setup/report/conversation captures and `visual-review.json`.

### Separate review pass

Compared actual full-page desktop and mobile captures against the user-selected third mockup and the Poster People reference. Confirmed the large serif heading, decorative yellow people stamp, numbered route, pink current area, source quote beside meaning, and stacked mobile reading order. The working application additionally retains phase navigation and source tabs. Reduced the report footer to candidate/role and the complete saved-role disclosure instead of repeating the full conversation process.

Reviewed the new map component, controlled RecordSheet API, CSS, role projection and eligibility boundary after implementation. Map state is presentation-only; no scenario schema, domain transition or saved application/CV/score/history data changed in this iteration. All interpretation and prepared quotes remain behind the existing eligibility check. Hidden/unselected areas do not contribute result controls. The editor stays outside changing report tabs; source navigation still focuses the actual answer. Existing RecordSheet consumers remain uncontrolled unless both new optional props are provided.

Review result: no unresolved functional/visual finding within this iteration's exercised scope. Default Bash/Chromium provisioning remains open; this does not establish full accessibility compliance, human approval of the implemented screen, CI or deployment. The earlier company-page findings are outside this task. No merge or publication was performed.

### Preview

The live development preview continues at `http://127.0.0.1:3013/#/app/kandydaci/application-example/rozmowa`. Its module response was checked against this checkout. Select Karolina Wiśniewska if needed; existing saved conversations use the new layout immediately. For a fresh example: choose areas → load prepared answers → complete the questions → finish the simulated conversation.
