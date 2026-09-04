# Concepts

Use one entry per important concept.

## Template

### `<Concept>`
- Status: not_started
- Mastery: 0/5
- Mental model:
- Why this project needs it:
- Can explain:
- Can implement:
- Can debug:
- Alternatives/trade-offs:
- Common confusion:
- Follow-up challenge:

---

Add concepts below this line.

### `Effect<A, E, R>` as a lazy description
- Status: in_progress
- Mastery: 3/5
- Mental model: a value describing a computation; nothing runs until a runtime (`it.effect`, `Effect.runPromise`) executes it.
- Why this project needs it: every todo operation is an effect so errors and dependencies are visible in the type.
- Can explain: not yet verified aloud
- Can implement: yes — `addTodo`, `toggleTodo` with correct inferred `A`/`E` (2026-09-03)
- Can debug: partially — needed a hint that `R = unknown` came from an unresolved identifier under `yield*`
- Alternatives/trade-offs: promises (eager, untyped errors)
- Common confusion: reading a language-service diagnostic (`missingEffectContext`) before the underlying TS error
- Follow-up challenge: predict ids when the same `addTodo` effect value is yielded twice

### `Effect.fn` / `Effect.gen` / `yield*`
- Status: in_progress
- Mastery: 3/5
- Mental model: generator body where `yield*` unwraps `A` and accumulates `E`/`R`.
- Why this project needs it: main sequencing tool for domain operations.
- Can implement: yes, first attempt without hints.
- Common confusion: none observed yet

### `pipe` + `Effect.flatMap` / `Effect.map` / `Effect.tap`
- Status: in_progress
- Mastery: 3/5
- Mental model: `map` for plain values, `flatMap` for steps returning effects; each step sees only the previous result.
- Can implement: yes — student chose `pipe` + `flatMap` for a three-step chain on their own initiative.
- Follow-up challenge: compare with `gen` when a later step needs an earlier intermediate value.

### `Effect.flip` (asserting on errors)
- Status: in_progress
- Mastery: 3/5
- Mental model: swaps `A` and `E` so an expected error can be `yield*`-ed.
- Can implement: yes, with a direction hint.

### `Schema.TaggedError`
- Status: in_progress
- Mastery: 3/5
- Mental model: a class with `_tag` and typed fields; an instance is yieldable and lands in `E`.
- Why this project needs it: selective handling (`catchTag`), data in errors (`id`), later HTTP status mapping.
- Can implement: yes (2026-09-04), first attempt at asserting used `toEqual` against a plain object — fixed after seeing the diff.
- Common confusion: comparing a class instance with a literal via `toEqual`.
- Follow-up challenge: second error type in the same `E` union, then shrink it with `catchTag`.

### `Schema.decode*` family + `Effect.mapError`
- Status: in_progress
- Mastery: 3/5
- Mental model: `decodeEffect(schema)(encoded)` runs transformations (`Trim`) and checks and returns `Effect<Type, SchemaError>`; `Unknown` in the name only widens the input to `unknown`; the suffix (`Effect`/`Sync`/`Result`/`Option`) picks the result wrapper. `mapError` is `map` for the `E` channel: the callback returns the new error as a plain value.
- Why this project needs it: keeps `EmptyTitle | TitleTooLong` in `E` while the rules live in the schema; the same `Title` schema will validate the form and `localStorage` data.
- Can explain: asked why not `decode` when the input type is known - correct instinct (2026-09-04)
- Can implement: yes, third attempt (`.make` first, then `decodeEffect` without `mapError`)
- Common confusion: `.make` validates a `Type` value and throws (defect) - it does not decode; tried to return an effect from the `mapError` callback? (not observed, explained preventively)
- Follow-up challenge: decode a whole `Todo` from `unknown` (localStorage) in Phase 7 and map `SchemaError` to a repository error.

### Schema `Type` vs `Encoded`
- Status: in_progress
- Mastery: 2/5
- Mental model: every schema has two sides - `Type` (in memory) and `Encoded` (after `encode`, what goes to JSON/storage). `Schema.DateFromString`: `Type = Date`, `Encoded = string`. v4 difference: `Schema.Date` is `declare<Date>` with both sides `Date`, no transformation.
- Why this project needs it: `localStorage` in Phase 7 stores strings; `decode` restores `Date`, `JSON.parse` cannot. The domain never encodes - only the repository at the boundary.
- Can explain: partially - said `JSON.stringify` uses `toString` (it is `toJSON`); did not yet articulate the symmetry argument for `encode`
- Can implement: `createdAt` added and filled via `Effect.sync(() => new Date())` unaided (2026-09-05)
- Common confusion: v3 `Schema.Date` (string -> Date) vs v4 `Schema.Date` (Date -> Date); wondering whether the domain should encode
- Follow-up challenge: in Phase 7 write the repository `save`/`load` with `encodeSync`/`decodeUnknownEffect` and map `SchemaError` to a repository error.
