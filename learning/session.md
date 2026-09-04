# Current Learning Session

## Session
2026-09-03 — session 1

## Phase
Phase 3 — Schema (Phase 0 toolchain quiz skipped at student's request)

## Concept
Type vs Encoded: the domain works with `Type`, `encode`/`decode` happen only at the storage boundary

## Goal
An empty Vite + React + TypeScript project that starts with `pnpm dev` and lives under git.

## Current Task
Next: Phase 3 step 4 - `Schema.Class` vs `Schema.Struct` (short, optional), then Phase 4: `Effect.Service` / layers, starting with the two side effects already in `addTodo` (`crypto.randomUUID`, `new Date()`) as injectable services so tests stop depending on real ids and clocks.

Done 2026-09-05 (Phase 3 step 3): student added `createdAt` on own initiative with `Schema.Date`, corrected to `Schema.DateFromString` after learning the v4 difference (`Schema.Date` is `declare<Date>`, Type = Encoded = Date; `DateFromString` is `decodeTo<Date, String>`); `new Date()` wrapped in `Effect.sync` unaided; `Todo` schema exported. Student asked whether `addTodo` must encode the date - answer: no, domain stays in `Type`, encode lives in the repository (Phase 7). Student's `JSON.stringify` answer: "Date has toString called under the hood" - corrected to `toJSON`; the real reason for `encode` is symmetry with `decode` (`JSON.parse` cannot restore `Date`, schema can). Mentor added two tests: encode/decode round-trip through `JSON.parse(JSON.stringify(...))`, and an invalid `createdAt` string failing with `SchemaError`. `pnpm check` green, 13 tests.

Done 2026-09-04 (Phase 3 step 2): `Title = Schema.Trim.check(isNonEmpty(), isMaxLength(100))`; `validateTitle` = `Schema.decodeEffect(Title)(title).pipe(Effect.mapError(...))` choosing `EmptyTitle` / `TitleTooLong({ max: 100 })` by `title.trim().length`; shared by `addTodo` and `renameTodo`. Student's first attempt used `NewTodoInput.make(title)` (object into a string field, validation vanished from `E` because `.make` throws); second attempt yielded `decodeEffect` without `mapError` (`E = SchemaError`); third attempt correct after the explanation that `mapError`'s callback returns a value, not an effect. Mentor added three tests (whitespace -> `EmptyTitle`, 101 chars -> `TitleTooLong` with `max`, exactly 100 after trim passes). `pnpm check` green, 11 tests.

Previous (done 2026-09-04): brand `TodoId` with `Schema.brand("TodoId")`; observe which call sites stop compiling (tests passing plain strings) and fix them by constructing a `TodoId` via the schema.

Previous: student answered the defect question with the symptom (unparsable/missing data) rather than the criterion; corrected: missing data is not an error, unparsable data is `SchemaError` in `E` handled by the repository (fallback + log), a defect only where nobody can handle it. Earlier: why a broken `crypto.randomUUID` is a defect and an empty title is an `E` error (criterion: can the caller do something meaningful about it?). Demo script `scratch/fail-vs-die.mts` written by mentor at student's request (2026-09-04): fail+catchTag recovers; throw in sync passes through `Effect.catch`; `catchDefect` recovers; `catchTag` on `E = never` is a compile error.

Previous: Phase 2 remaining concepts - `Effect.die` vs `Effect.fail` (defects), `Effect.exit` / `Exit`, `Cause.pretty`; then Phase 3 (student already uses `Schema.Struct`).

Previous: two missing tests (written by mentor, 8 tests green): `removeTodo` with a missing id; `EmptyTitle` passing through `catchTag("TodoNotFound")` (existing id, whitespace title, `Effect.flip` after `catchTag`).

Previous: `removeTodo(todos, id)` with `E = TodoNotFound` reusing `findTodo`, plus a test; and the `EmptyTitle`-passes-through-`catchTag` test.

Previous: Phase 2 step 3: `renameTodo(todos, id, title)` with `E = TodoNotFound | EmptyTitle`, title validation extracted and shared with `addTodo`; test that handles only `TodoNotFound` with `catchTag` and shows `EmptyTitle` remains in `E`.

Previous: Phase 2 step 2: `EmptyTitle` error (`Schema.TaggedError`, no fields or `title`) in `addTodo` when the trimmed title is empty; signature becomes `Effect<Todo[], EmptyTitle>`; test with `Effect.flip`. Observe how `E` of the pipe chain in the first test grows to `EmptyTitle | TodoNotFound`.

## Prerequisites
- Node 24, pnpm 11 present
- Latest `effect@rc` / `@effect/vitest@rc` / `@effect/atom-react@rc` observed: 4.0.0-rc.112 (to be pinned in the next step)

## Expected Evidence
- `package.json`, `tsconfig*.json`, `src/main.tsx`, `src/App.tsx` exist
- `pnpm dev` serves the default page
- `git status` shows the scaffold plus the learning files, `node_modules` ignored

## Status
Phase 3 step 2 done and verified 2026-09-04, 11 tests green. Mentor's own slip while writing the `max` test: `Effect.flip` gives `EmptyTitle | TitleTooLong`, so `error.max` does not typecheck; asserted with `toMatchObject({ max: 100 })` after `toBeInstanceOf`. Earlier: brand done by student in domain (`TodoId.make(crypto.randomUUID())`, `removeTodo` simplified); mentor fixed the three test call sites with `TodoId.make` and exported the `TodoId` value. `pnpm check` green, 8 tests. Earlier: student preference recorded 2026-09-04: mentor writes routine tests, student writes domain code; tests as a learning target return in Phase 5. Earlier: `removeTodo` done unaided and correct (2026-09-04), 6 tests green; success test uses `Effect.tap` + `Effect.sync`. Two of three requested tests missing. Earlier: SOLUTION MODE used twice on 2026-09-04 at student's request: (1) the two `renameTodo` tests, (2) refactor of `src/domain/todo.ts` - `validateTitle`, `findTodo` (both `Effect.fn`), pure `replaceTodo`, `ReadonlyArray<Todo>` results, `TodoId` type export. Lesson recorded: a return-type annotation on the generator itself breaks `Effect.fn` inference; type the value instead. `pnpm check` green, 5 tests. Student's own follow-up exercises pending: (a) test that `EmptyTitle` passes through `catchTag("TodoNotFound")`, (b) `removeTodo` using `findTodo`, written unaided. Earlier: mentor wrote the two `renameTodo` tests; 5 tests green. Remaining for the student: shared title validation, explicit `ReadonlyArray<Todo>` return types, follow-up exercise (test that `EmptyTitle` still propagates after `catchTag`). Earlier: `renameTodo` implemented with `E = TodoNotFound | EmptyTitle` (correct). Student introduced `Schema.Struct` for `Todo` and `TodoId = Schema.String` on own initiative (Phase 3 material, accepted). Still missing: shared title validation, explicit `ReadonlyArray<Todo>` return type, the rename test (draft never yields the pipe — laziness trap; asked how to mock `crypto`, answer: take the id from `addTodo`'s result). Earlier: `addTodo` reworked correctly (validation pure, `sync` only around `randomUUID`), 3 tests green. `renameTodo` task still pending. Earlier: Phase 2 step 2 done 2026-09-04: `EmptyTitle` via `filterOrFail`, 3 tests green, signatures correct. Notes: `randomUUID` now inside `Effect.map` (side effect in a mapper); no whitespace-only test; student discovered `catchTag` unaided. Earlier: Phase 2 step 1 done and verified 2026-09-04 (`pnpm check` green; test asserts only `toBeInstanceOf`, `id` check skipped — noted). Earlier: Phase 1 app work done and verified (`pnpm typecheck`, `pnpm lint`, 2 tests green; `format:check` failed — student to run `pnpm format`). Laziness question answered correctly (ids differ, effect re-runs each time). Still open: return type `Todo[]` vs `ReadonlyArray<Todo>`. Committed as 32d3335 at student's request (format:check still failing). Student reported TaggedError step as done but the file was unchanged — probably unsaved; asked to re-check.

## Student Explanation
-

## Verification
- Tests: 13 passed (`src/__tests__/todo.test.ts`)
- Typecheck: pass
- Lint: pass
- Format: pass
- Diff: first commit 32d3335; next review via `git diff`

## Mentor Notes
- Explained `Effect.fn` vs `Effect.gen` with a scratch script: `Cause.pretty` shows `name (definition)` + call-site frames for `fn`, only an anonymous frame for `gen`.
- Curriculum, roadmap and progress files were pre-filled; repository had no code and no git at session start.
- Student asked the mentor to scaffold and set up tooling (allowed: not application code). Done: Vite react-ts template, `effect@4.0.0-rc.112` pinned, Vitest 4.1.11 (`@effect/vitest` peer range excludes Vitest 5), oxlint 1.81, oxfmt 0.66 (no semicolons, double quotes, width 100), `strict` + `exactOptionalPropertyTypes` explicit, `test/` included in `tsconfig.app.json`, vitest `include` limited to `test/**`.
- pnpm 11 quirk: build-script approval lives in `pnpm-workspace.yaml` under `allowBuilds`.
- User's global git ignore excludes `*.md` and `.claude/`; local `.gitignore` re-includes them.
- Smoke test with `it.effect` passed and was deleted so the student writes the first real test.
- Student declined the toolchain comprehension questions as too basic ("давай сразу к делу"); adapt: less scaffolding, larger tasks, verify understanding through code and design questions rather than quiz questions.

## Next Step
Phase 4: services for id generation and clock (`Effect.Service`, `Layer`), test layers with fixed values; `Schema.Class` mentioned only if a use case appears.
