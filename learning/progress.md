# Learning Progress

## Current Session
See `learning/session.md`.

## Current Phase
Phase 6 started 2026-09-06 (React + `@effect/atom-react`). Phase 4 done; Phase 5 folded into Phase 4 (`layer()`, `it.layer`, `TestClock`, `layerTest`).

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
| `Context.Service` + `Layer.succeed` + `Effect.provide` (`R` channel) | 3/5 | `IdGenerator` with static `layer` written with guidance, `Effect.provide` in tests found unaided (2026-09-05); dependency direction (domain vs services) needed two reminders |
| `Context.Reference` / `Clock` / `TestClock` | 2/5 | asked how to see the default implementation; confused the `Clock` key with the value it yields (2026-09-05) |
| `Layer.effect` + `Ref` | 3/5 | `layerTest` with a `Ref` counter written correctly on first attempt from the task's theory (2026-09-05) |
| Repository as a service (`TodoRepository.layerMemory`) | 3/5 | `all`/`save` over a `Ref` correct on second attempt (2026-09-05); first attempt piped a plain array into `Effect.tap` |
| Use case over repository (`R` composition) | 3/5 | `createTodo` on third attempt; toggle/rename/remove written independently and correctly (2026-09-06), span name copy-paste bug |
| Error propagation via `yield*` (short-circuit) | 2/5 | described it as "handled inside" - the mechanism is not yet internalized (2026-09-06) |
| Generic effect helpers (higher-order `Effect.fn`, `<E, R>` passthrough) | 2/5 | saw the solution in SOLUTION MODE (2026-09-06); did not find the shape alone; answered the tracing question correctly |
| `Exit`/`Cause` inspection (`Effect.exit`, `Cause.hasDies`/`hasFails`) | 2/5 | used `Exit.isFailure` for a defect check; needed the fail-vs-die distinction pointed out again (2026-09-06) |
| `@effect/vitest` `layer()` / `it.layer` | 2/5 | passed an effect where a suite callback is expected (2026-09-06) |
| `Atom.runtime` + `runtime.atom` + `useAtomValue` + `AsyncResult.builder` | 3/5 | step 1 wired unaided from the task's theory (2026-09-06); explained why the runtime lives at module level (new instance per render), consequence for the `Ref` supplied by mentor |
| `runtime.fn` + `useAtom`/`useAtomSet` + reactivity keys | 4/5 | create wired from the hint, toggle/remove wired independently with the shared key (2026-09-06); hypothesised "effect runs once, needs a re-run per event" before knowing the registry; picked `useState` for `disabled` first, accepted `result.waiting` |
| `AsyncResult` states: `Initial` vs `waiting` flag | 3/5 | observed no flicker with the sync memory layer, understood why `onInitial` is right for the list (2026-09-06) |
| Derived atoms: `Atom.make((get) => ...)`, `Atom.make(initial)` + `useAtom`, `AsyncResult.map` | 4/5 | filter written after the theory, first draft used `Effect.gen` + `get.result`; "N items left" counter written independently on first attempt (2026-09-06); correctly traced what re-runs on a toggle (including `TodoFilter` because the counter lives there) and that `E = never` makes the non-defect `onFailure` branch unreachable |
| `useAtomSet(..., { mode: "promise" })` + local `useState` next to atom state | 3/5 | step 7 (2026-09-07): wrote the atom and the hook but omitted `mode: "promise"`, put the per-card `editing` state in the list's `map` via a slot; mentor finished `TodoCard` in SOLUTION MODE; `useTodoForm` follow-up done unaided (first draft leaked an unhandled rejection, fixed after a question); explained why toggle/remove need no promise |
| `AsyncResult.builder` error branches (`onErrorTag`, `orNull` vs `render`) | 3/5 | both tags handled on the second attempt; picked `render()` first despite the throw-on-unhandled explanation (2026-09-06) |
| `Schema.TaggedError` | 3/5 | `TodoNotFound` with `id`, yielded directly; `toBeInstanceOf` assertion, 2026-09-04 |

## Strengths
- Prefers to spend time on domain/Effect code; routine tests delegated to mentor (agreed 2026-09-04)
- Fast with plain TS/JS; wants less scaffolding and larger tasks
- Immutable updates (`map` with spread) come naturally

## Weak Areas
- Reaches for a service/layer where a plain function suffices; declares interfaces with `E = never` that hide domain errors
- Thinks of error propagation as "handling": needs the short-circuit model (`yield*` on a failure stops the generator)
- Module dependency direction: put a domain type (`TodoId`) into a service file; domain must not depend on infrastructure
- Asked for SOLUTION MODE twice in a row (tests, refactor) - next tasks must be done unaided to confirm 3/5 levels
- Side effect (`crypto.randomUUID()`) moved from `Effect.sync` into an `Effect.map` callback — convention issue to discuss
- Skips design questions when not tied to a task (ReadonlyArray asymmetry asked 3 times)
- Leaves unused imports after experiments (`Layer` twice, `Exit`, `TodoItem`); reports "done" without running `pnpm check` - agreed 2026-09-06 that "done" implies a green check
- Reads the top-most editor diagnostic instead of the first `tsc` error (language-service `missingEffectContext` vs `Cannot find name`)

## Recurring Mistakes
- See `learning/mistakes.md`

## Last Completed Milestone
2026-09-07 — Phase 6 step 7 follow-up: `useTodoForm` in promise mode, form reset only after success; `pnpm check` green, 23 tests

Previous: 2026-09-07 — Phase 6 step 7: inline rename via `renameTodoAtom` + `mode: "promise"`, `TodoCard` owns edit state (finished in SOLUTION MODE); `pnpm check` + `pnpm build` green, 23 tests

Previous: 2026-09-06 — Phase 6 step 6: "N items left" derived counter written independently; `pnpm check` green, 23 tests

Previous: 2026-09-06 — Phase 6 step 5: `all | active | completed` filter via a plain atom + a derived atom over `todosAtom`; `pnpm check` green, 23 tests

Previous: 2026-09-06 — Phase 6 step 4: typed domain errors rendered under the form by tag; `pnpm check` green, 23 tests

Previous: 2026-09-06 — Phase 6 step 3: toggle/remove through `runtime.fn` sharing the reactivity key, list untouched; `pnpm check` green, 23 tests

Previous: 2026-09-06 — Phase 6 step 2: create todo from the form via `runtime.fn`, list refreshes through reactivity keys; `pnpm check` green, 23 tests

Previous: 2026-09-06 — Phase 6 step 1: todo list rendered from `TodoRepository` through `Atom.runtime`/`runtime.atom`, three `AsyncResult` states; `pnpm check` green, 23 tests

Previous: 2026-09-06 — Phase 4 exit check: broken-storage layer swapped in one test, callers unchanged; 23 tests green

Previous: 2026-09-06 — Phase 4 step 7 (SOLUTION MODE): `updateTodos` generic helper, use cases as one-liners; 22 tests green

Previous: 2026-09-06 — Phase 4 step 6: toggle/rename/remove use cases done independently; 22 tests green

Previous: 2026-09-06 — Phase 4 step 5: `createTodo` use case, `Layer.merge` in tests; 20 tests green

Previous: 2026-09-05 — Phase 4 step 4: `TodoRepository` + `layerMemory`; 17 tests green

Previous: 2026-09-05 — Phase 4 step 3: `IdGenerator.layerTest` (`Layer.effect` + `Ref`), nested `it.layer` block with whole-object assertions; 15 tests green

Previous: 2026-09-05 — Phase 4 step 2: `createdAt` via `DateTime.nowAsDate`, `TestClock` test; 14 tests green

Previous: 2026-09-05 — Phase 4 step 1: `IdGenerator` service, `addTodo` requires it via `R`, tests share the layer through `layer()`; 13 tests green; commit 9ed6736 covers Phases 2-3

Previous: 2026-09-05 — Phase 3 step 3: `createdAt: Schema.DateFromString`, `new Date()` in `Effect.sync`, round-trip test; 13 tests green

Previous: 2026-09-04 — Phase 3 step 2: title validation via `Schema.Trim.check(...)` + `decodeEffect` + `mapError`, `E = EmptyTitle | TitleTooLong` honest again; 11 tests green

Previous: 2026-09-03 — Phase 1 application work: `addTodo`/`toggleTodo` as effects, two `it.effect` tests green

Previous: 2026-09-03 — project scaffolded (Vite + React 19 + TS 6 strict, effect 4.0.0-rc.112, Vitest 4.1 + @effect/vitest, oxlint, oxfmt); `pnpm check` green
