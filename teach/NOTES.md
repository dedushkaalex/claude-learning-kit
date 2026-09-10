# Notes

- Workspace lives in `teach/` so the repo root stays the application.
- Lessons and reference pages are written in Russian at Alex's explicit request (2026-09-07); code, API names and UI labels stay in English. Keep sentences short, examples first, framework terms after the plain-JS version.
- Alex dislikes long TypeScript error stacks: teach reading them bottom-up.
- Alex habitually disables React StrictMode; lesson 0001 addresses this without lecturing.
- Reports "done" without running `pnpm check` (recurring); lessons should end with a self-check the learner runs.
- Prefers interactive verification over theory (built a hide/show button on their own to see release fire).
- Review materials (2026-09-10): `reference/glossary.html` is the vocabulary contract; check new lesson text against it before publishing. Recall cards (`assets/recall.js`) store grades under `localStorage` key `recall:<id>`; the spacing plan is in lesson 0003, section 1.
- Alex asked for the review pack with an explicit text style: established terms only, no metaphors, identifiers in code font, no «про», no praise. Apply to every lesson and reference page.
