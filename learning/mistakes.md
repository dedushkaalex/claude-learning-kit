# Mistakes & Misconceptions

Record recurring mistakes, not every typo.

## Template

### `<Concept / mistake>`
- Observed:
- Why it happened:
- Correct mental model:
- Evidence of correction:
- Follow-up exercise:

---

Add recurring mistakes below this line.

### Returning an effect from a `sync` / `map` callback
- Observed: 2026-09-04, `addTodo` returned `Effect.fail(new EmptyTitle())` from inside `Effect.sync`; `A` became `Todo | Effect<never, EmptyTitle>` and the error sat in the array as data. Earlier (2026-09-03) the same shape was discussed for `map` vs `flatMap` when chaining two `addTodo` calls.
- Why it happened: `sync`/`map` callbacks are treated like `async` bodies where a returned promise is flattened; Effect does not flatten.
- Correct mental model: `sync`/`map` take functions returning plain values; a callback that returns an effect needs `flatMap` (pipe) or `yield*` (gen). Validation is pure and needs no `sync` at all.
- Evidence of correction: fixed unaided after a concept hint — `if (...) return yield* new EmptyTitle()` then `yield* Effect.sync(() => crypto.randomUUID())`.
- Follow-up exercise: spot the same shape inside `Effect.tap` / `Effect.flatMap` when a callback returns a plain value by mistake.

## Domain type moved into a service module
- Seen: 2026-09-05, `TodoId` schema relocated to `src/services/IdGenerator.ts` because the service needed it.
- Why it is wrong: the domain then imports from infrastructure; adding one more dependency in either direction creates an import cycle.
- Fix: entity types live in `src/entities/<entity>/types.ts`; everything else in the entity folder imports them. Since 2026-09-06 `TodoId`, `Title`, `Todo` and the three errors all live in `src/entities/todo/types.ts`, and `todoIdGenerator.ts` imports from it — the arrow can only point one way.

## Plain value at the head of an Effect pipe
- Seen: 2026-09-05, `pipe(todos, Effect.tap(...), Effect.void)` where `todos` is an array; earlier (2026-09-04) `Effect.fail` returned from inside `Effect.sync`.
- Why it is wrong: `Effect.tap`, `Effect.map`, `Effect.void` expect an `Effect` on the left; a plain value makes the chain `any`/nonsense.
- Fix: start from the effect that does the work (`Ref.set(storage, todos)`); use `tap` only to attach a side effect to an existing effect.

## `Effect.fn` wrapped inside an arrow instead of wrapping the parameters
- Seen: 2026-09-06, `const createTodo = (title) => Effect.fn("createTodo")(function* () {...})`.
- Why it is wrong: `Effect.fn(...)(gen)` returns a function, so `createTodo(title)` yields `() => Effect`, not an `Effect`; typecheck stays green until someone calls it.
- Fix: parameters go on the generator: `Effect.fn("name")(function* (title: string) {...})`.

## Service interface declared with `E = never`
- Seen: 2026-09-06, `createTodo: (title) => Effect<ReadonlyArray<Todo>>` in a hand-written service shape while the implementation fails with `EmptyTitle | TitleTooLong`.
- Why it is wrong: the interface lies about errors; the compiler rejects the layer, or callers lose the ability to `catchTag`.
- Fix: for a single implementation write a plain `Effect.fn` and let `E`/`R` be inferred; declare a service only when a second implementation or shared state justifies it, and copy the real `E` into the shape.

## Unused import left after an experiment (TS6133)
- Seen: `Layer` in a test file twice (2026-09-05), `Exit` in `src/App.tsx` and `TodoItem` in `src/ui/TodoListView.tsx` (2026-09-06), `pipe` in `todoRepository.ts` reported "готово" twice with it still there, then `Cause`/`Exit` in `todoRepository.test.ts` (2026-09-07). `pnpm check` fails on typecheck before tests even run.
- Pattern 2026-09-07: three "готово" in a row on Phase 7 step 2 without running `pnpm check`; each round the mentor found the next unused import. The agreement "done = green check" is not being applied.
- Why it happens: an import is added while trying an API, the code path is deleted, the import line stays; the editor shows no red because the language service diagnostic sits below the fold.
- Fix: run `pnpm typecheck` before reporting "done"; read the first `tsc` error, not the editor's top-most one.
