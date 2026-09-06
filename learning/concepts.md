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

### `R` channel: `Context.Service`, `Layer`, `Effect.provide`
- Status: in_progress
- Mastery: 3/5
- Mental model: `R` lists the services an effect needs before it can run. `Context.Service<Self, Shape>()("app/Name")` makes a class that is the key; `yield* Key` fetches the implementation and adds `Key` to `R`; `Layer<Out, E, In>` is a recipe for building services; `Effect.provide(layer)` removes `Out` from an effect's `R`; `Layer.provide(inner)` satisfies another layer's `In`.
- Why this project needs it: `addTodo` must not decide where ids/time/storage come from; tests and `localStorage`/HTTP layers swap implementations without touching callers.
- Can explain: asked good questions (static `layer` vs `Live` constant; `Effect.provide` vs `Layer.provide`) - answers given, not yet retold by the student
- Can implement: `IdGenerator` with `static readonly layer` and `yield* IdGenerator` in `addTodo` (2026-09-05, with the shape given in the task)
- Common confusion: v3 `Effect.Service` auto-generated `.Default`; v4 `Context.Service` only creates the key, layers are written by hand. `Live` suffix is a v3 habit.
- Follow-up challenge: write a second service (clock) and a `layerTest` unaided; explain why `layer()` in `@effect/vitest` builds the layer once per block.

### `Context.Reference` (services with a default): `Clock`, `TestClock`
- Status: in_progress
- Mastery: 2/5
- Mental model: `Context.Reference(key, { defaultValue })` is a service key that falls back to `defaultValue()` when nothing is provided, so `yield* Clock.Clock` does not add to `R`. `DateTime.nowAsDate` reads it and wraps millis in a `Date`. `it.effect` swaps in `TestClock` (time starts at epoch 0; `TestClock.setTime` moves it); `it.live` keeps real time.
- Why this project needs it: `createdAt` becomes deterministic in tests without a custom clock service.
- Can explain: asked "how do I know what the default is" - shown `ClockImpl` in `effect/internal/effect.js`
- Can implement: yes after one correction (stored the service object instead of the date)
- Common confusion: the service key (`Clock.Clock`) vs the value an effect built on it produces (`DateTime.nowAsDate`); why `IdGenerator` has no default (no universally right implementation, and an explicit `R` prevents silently random ids in tests)
- Follow-up challenge: explain what would change in `addTodo`'s type if `IdGenerator` were a `Reference`.

### `Layer.effect` + `Ref`
- Status: in_progress
- Mastery: 3/5
- Mental model: `Layer.effect(Key, effect)` builds the implementation with an effect (state, config, other services); the layer is built once per `layer()`/`Effect.provide` scope, so a `Ref` created inside is shared by every consumer in that scope. `Ref` is a mutable cell whose reads/writes are effects (`Ref.make`, `Ref.get`, `Ref.getAndUpdate`, `Ref.updateAndGet`).
- Why this project needs it: deterministic ids in tests; next, `TodoRepository.layerMemory` keeps the todo list in a `Ref`.
- Can implement: yes, `layerTest` first try (2026-09-05)
- Can explain: "one Ref per block because the layer is one instance" (2026-09-05)
- Common confusion: expected `Date.now()` in a `TestClock` test; asserted a string where the domain has a `Date`
- Follow-up challenge: explain why the second test in the nested block receives `todo-2`, and what changes if `layerTest` is provided per test with `Effect.provide` instead of `it.layer`.

### Layer memoization and `Layer.fresh`
- Status: introduced
- Mastery: 1/5
- Mental model: within one runtime/memo map (a `layer()` block in `@effect/vitest`, or one `Effect.provide` tree) a layer value is built once and shared by reference; providing the same layer again reuses the instance. `Layer.fresh(layer)` opts out. A layer never built in the enclosing scope is built on `Effect.provide`.
- Why this project needs it: explains why `save` in one test was visible to `Effect.provide(layerMemory)` in another; matters when the app wires `layerMemory` in several places.
- Evidence: `src/__tests__/TodoRepository.test.ts` pair (shared vs `Layer.fresh`), 2026-09-05; not yet discussed with the student
- Follow-up challenge: predict the id in `todo.test.ts` if the `Effect.provide(IdGenerator.layerTest)` test moved inside the nested `it.layer(IdGenerator.layerTest)` block.

### Higher-order effect helpers (generic `E`/`R` passthrough)
- Status: introduced
- Mastery: 2/5
- Mental model: a helper that takes a step `(input) => Effect<A, E, R>` must be generic in both `E` and `R`; otherwise every caller gets the union of all errors (`catchTag` stops narrowing) or the step's requirements are rejected (`R = never`). `Effect.fn` accepts a generic generator and also a plain `(args) => Effect` function, so each use case keeps its own named span.
- Why this project needs it: four use cases share `all -> step -> save`; the helper removes the copy-paste that already produced a wrong span name.
- Can explain: tracing consequence yes ("trace would show updateTodos; pass own name in each factory")
- Can implement: not yet alone (SOLUTION MODE 2026-09-06)
- Common confusion: "wrap in a service so the repository is initialised once" - `yield* Service` is a context lookup, not construction
- Follow-up challenge: write a similar generic helper for the repository (`withTodos`) that only reads, and predict its `E`/`R` before compiling.
