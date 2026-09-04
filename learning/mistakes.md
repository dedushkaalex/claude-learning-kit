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
