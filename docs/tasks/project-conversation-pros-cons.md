# Evidence-linked answer pros and cons

## Intent and acceptance

Continue on `codex/project-conversation`, preserving existing changes. Implement the user's accepted plan: show “Plusy odpowiedzi” and “Minusy odpowiedzi” for each of the five project-map areas, including project context, in the available recruiter example report.

- Add 1–2 prepared positive points per area and only supported negative points (up to two); every point quotes the corresponding prepared answer verbatim and explains relevance to the role.
- Explicitly separate disclosed limitations from missing information. Do not manufacture a negative point when the answer does not disclose one; display the agreed empty-state sentence instead.
- Place the two lists before unknowns in the interpretation column. Reuse existing serif headings and unboxed semantic lists with decorative +/− markers. No score, traffic-light color or extra card family.
- Keep the existing source editing control and report eligibility gate. Candidate views, draft/custom answers and changed scope/answers must not expose these points; invalidation survives reload.
- No change to saved schemas, operations, exports/imports, application/CV snapshots, score, stages, immutable kit or global tokens. Update FEATURES.md in the same work.
- Verify quote grounding, all area switches, empty negatives, recruiter visibility, edit/reload/scope suppression, keyboard source focus, mobile/320px layout and accessibility. Run the required project checks and a separate review; record actual limitations.

## Validation and review

Implemented as prepared, typed report data plus a feature-local semantic list composition. Context and contribution have two pros and no fabricated cons; decisions, evaluation and limitations have two pros and one explicitly supported limitation each. All thirteen point quotes match their own prepared answers. No schema, state operation, original prepared answer or shared primitive changed.

### Executed checks

- `./scripts/verify` was attempted with the bundled shell and stopped because Bash is unavailable. `npm run check` passed formatting, immutable kit integrity (67 files and six kit tests), lint, types, 33 unit tests, baseline packet and static build. Its default browser phase could not launch the missing Playwright Chromium headless shell. No browser binaries or OS dependencies were installed. Existing upstream Zod annotation and bundle-size warnings remain nonblocking.
- All 37 browser journeys passed in installed Chrome with the existing ignored local config. Expanded conversation checks verify pros/cons and their relevant quotes across all five areas, empty-negative messaging, candidate omission, scope invalidation, immediate/reload/custom-answer suppression, keyboard area selection, source-tab navigation and quote-to-editor focus. Scoped Axe scans report zero violations.
- The new unit test validates that every assessment point has nonempty text and a verbatim quote in its own answer, all five areas have 1–2 pros, cons stay within the limit, and context/contribution retain empty cons.
- Existing conversation and report breakpoint checks include 1280px desktop, 390px mobile and 320px, plus adjacent 850/600 boundaries. The new assessment container is included in actual bounding-box checks rather than relying only on document width.
- Ran the reference catalog/offer at port 8952 and inspected the live checkout at 3013 in isolated browser contexts. Source and host retain white surfaces, ink rgb(24,24,24), 24px radii, a single 1px contour, Geist Serif 400 headings and existing pink action treatment. New list text is 15px; source excerpts use 13px muted text with a thin neutral rule. No new cards or semantic red/green assessments were added. Captures, measured values and logs are in ignored `artifacts/project-conversation-pros-cons/`.

### Separate review pass

Reviewed the prepared text and each quote against the full original answer, the component placement, role/eligibility branch and scoped styles after implementation. Negatives describe disclosed limitations of actions or measurement; missing information remains in the existing unknowns. The limitations point carefully describes what the candidate proposes for the next pilot rather than inventing a verified historical omission. No point treats model-building ability as required for the Product Manager role.

Inspected complete desktop/mobile report captures. Plus/minus sections precede unknowns, use existing serif heading hierarchy and plain stacked lists, and wrap without clipping. Source excerpts stay near their corresponding point; the existing source control still opens and focuses the matching editable answer. Both lists are entirely inside the exact-answer recruiter report gate, with no persisted interpretation or new export fields.

Review result: no unresolved issue in the implemented scope. The normal Bash/default-Chromium gate remains unavailable; the individually passed checks and successful installed-Chrome run are the actual evidence. This does not establish CI, publishing, human research or hiring effectiveness. No merge or publication was performed. The user's local scenario was left unchanged by QA.

Preview continues at `http://127.0.0.1:3013/#/app/kandydaci/application-example/rozmowa`; existing eligible reports pick up the sections without data migration.
