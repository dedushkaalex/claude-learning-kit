# Learning Progress

## Current Session
See `learning/session.md`.

## Current Phase
Phase 1 — The Effect Value (near completion) → Phase 2 — Typed Errors

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
| `Effect.flip` | 2/5 | used with a direction hint |

## Strengths
- Fast with plain TS/JS; wants less scaffolding and larger tasks
- Immutable updates (`map` with spread) come naturally

## Weak Areas
- Reads the top-most editor diagnostic instead of the first `tsc` error (language-service `missingEffectContext` vs `Cannot find name`)

## Recurring Mistakes
- See `learning/mistakes.md`

## Last Completed Milestone
2026-09-03 — Phase 1 application work: `addTodo`/`toggleTodo` as effects, two `it.effect` tests green

Previous: 2026-09-03 — project scaffolded (Vite + React 19 + TS 6 strict, effect 4.0.0-rc.112, Vitest 4.1 + @effect/vitest, oxlint, oxfmt); `pnpm check` green
