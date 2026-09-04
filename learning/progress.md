# Learning Progress

## Current Session
See `learning/session.md`.

## Current Phase
Phase 3 — Schema (Phase 2 core done: TaggedError, catchTag, fail vs die, Exit/Cause; retry/timeout deferred until a flaky layer exists)

## Mastery Scale

- 0/5 — not encountered
- 1/5 — can recognize
- 2/5 — can explain with help
- 3/5 — can implement with guidance
- 4/5 — can implement independently
- 5/5 — can explain, implement, debug, and compare alternatives

## Concepts

| Concept | Mastery | Evidence |
|---|---:|---|
| Toolchain (pnpm, Vite, Vitest, tsc, oxlint, oxfmt) | 1/5 | Scaffold done by mentor at student's request on 2026-09-03; student has not yet explained what each command checks |
| TypeScript strict mode | 1/5 | Enabled explicitly in `tsconfig.app.json`; not yet explained by student |
| `Effect<A, E, R>` as lazy value | 3/5 | `addTodo`/`toggleTodo` with correct inferred signatures, 2026-09-03 |
| `Effect.fn` / `Effect.gen` / `yield*` | 3/5 | written without hints |
| `pipe` + `flatMap` | 3/5 | chose `pipe` for a 3-step chain on own initiative |
| `Effect.flip` | 3/5 | reused unaided for the TaggedError test, 2026-09-04 |
| `Effect.catchTag` | 2/5 | found on own initiative; the partial-handling test was written by mentor in SOLUTION MODE (2026-09-04) — needs an independent use |
| `Effect.filterOrFail` | 2/5 | used for `EmptyTitle` on own initiative |
| `Effect.tap` | 2/5 | used with `Effect.sync` for a mid-chain assertion, own initiative (2026-09-04) |
| Reusing helper effects (`findTodo`) | 3/5 | `removeTodo` written unaided on first try |
| Expected error vs defect | 2/5 | saw the demo; first answer used the symptom, not the "can the caller handle it" criterion (2026-09-04) |
| `Schema.brand` | 3/5 | applied unaided in domain, saw the three test sites fail to compile (2026-09-04) |
| `Schema.decodeEffect` + `Effect.mapError` | 3/5 | `validateTitle` correct on third attempt after learning that `mapError`'s callback returns a value (2026-09-04); asked a good question about `decodeUnknown*` vs `decode*` |
| Schema `Type` vs `Encoded` (`DateFromString`, encode/decode) | 2/5 | picked `Schema.Date` first (v3 habit), fixed after the v4 explanation; explained `JSON.stringify` via `toString` instead of `toJSON`; asked the right question about where encode belongs (2026-09-05) |
| `Schema.TaggedError` | 3/5 | `TodoNotFound` with `id`, yielded directly; `toBeInstanceOf` assertion, 2026-09-04 |

## Strengths
- Prefers to spend time on domain/Effect code; routine tests delegated to mentor (agreed 2026-09-04)
- Fast with plain TS/JS; wants less scaffolding and larger tasks
- Immutable updates (`map` with spread) come naturally

## Weak Areas
- Asked for SOLUTION MODE twice in a row (tests, refactor) - next tasks must be done unaided to confirm 3/5 levels
- Side effect (`crypto.randomUUID()`) moved from `Effect.sync` into an `Effect.map` callback — convention issue to discuss
- Skips design questions when not tied to a task (ReadonlyArray asymmetry asked 3 times)
- Reads the top-most editor diagnostic instead of the first `tsc` error (language-service `missingEffectContext` vs `Cannot find name`)

## Recurring Mistakes
- See `learning/mistakes.md`

## Last Completed Milestone
2026-09-05 — Phase 3 step 3: `createdAt: Schema.DateFromString`, `new Date()` in `Effect.sync`, round-trip test; 13 tests green

Previous: 2026-09-04 — Phase 3 step 2: title validation via `Schema.Trim.check(...)` + `decodeEffect` + `mapError`, `E = EmptyTitle | TitleTooLong` honest again; 11 tests green

Previous: 2026-09-03 — Phase 1 application work: `addTodo`/`toggleTodo` as effects, two `it.effect` tests green

Previous: 2026-09-03 — project scaffolded (Vite + React 19 + TS 6 strict, effect 4.0.0-rc.112, Vitest 4.1 + @effect/vitest, oxlint, oxfmt); `pnpm check` green
