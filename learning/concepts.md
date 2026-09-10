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

### Derived atoms (`Atom.make((get) => ...)`) and plain atoms (`Atom.make(initial)`)
- Status: in_progress
- Mastery: 4/5
- Mental model: a plain atom is a global variable with subscribers; a derived atom is a function whose dependencies are whatever it reads through `get`, re-run whenever one of them changes. No reactivity key: keys invalidate source atoms, `get` propagates the change downstream.
- Why this project needs it: the filter is UI state, not domain state; the visible list is computed from server data + filter without touching the repository.
- Can explain: dependency propagation, yes (2026-09-06); why no runtime: "runtime supplies the layer's services, a pure computation needs none" after a hint.
- Can implement: yes, independently — the count atom on first attempt (2026-09-06); first filter draft wrapped a pure computation in `Effect.gen` + `get.result`.
- Can debug: not yet verified
- Alternatives/trade-offs: `get.result(todosAtom)` inside an Effect (works, adds an Effect layer to a pure map); filtering inside the component with `useMemo` (duplicates per consumer).
- Common confusion: `AsyncResult.map` vs `get.result`; thinking `runtime.atom` is about `AsyncResult` rather than about services.
- Follow-up challenge: done (count atom). Next: decide component placement so a counter does not re-render unrelated UI.

### `useAtomSet(..., { mode: "promise" })` and local React state next to atoms
- Status: in_progress
- Mastery: 3/5
- Mental model: an `AtomResultFn` setter normally fires and forgets, the outcome lives in the atom's `AsyncResult`. With `mode: "promise"` the setter returns a `Promise` that resolves with the success value and rejects with `Cause.squash(cause)`, i.e. the error instance itself, so an event handler can `await` it and decide what to do with UI-only state (`editing`, `saving`) that no atom should hold.
- Why this project needs it: inline rename must close the input only after the repository accepted the new title and stay open with a message otherwise; that decision belongs to the card, not to a global atom.
- Can explain: why rename needs it and toggle/remove do not — yes, with the refinement that `waiting` already covers the intermediate state (2026-09-07); unmount question answered correctly (2026-09-07). Interrupt semantics of `runtime.fn` (same atom re-written -> previous fiber interrupted; different atoms independent) explained by the mentor after a guessed answer.
- Can implement: partially — atom + hook written, `mode` omitted; the state was placed in the list's `map` instead of a per-card component (2026-09-07); `TodoCard` finished by the mentor in SOLUTION MODE.
- Can debug: not yet verified
- Alternatives/trade-offs: reading `useAtomValue(renameTodoAtom)` for the outcome (one shared atom for all cards: the last result leaks into every card); storing `editingId` in an atom (global state for a local concern).
- Common confusion: building stateful JSX inline inside a `map` (slot) where `useState` cannot live; `handle*` aliases for hook results.
- Follow-up challenge: done 2026-09-07 — `useTodoForm` with `.then(reset).catch(() => {})`; first draft left the rejection unhandled.

### `KeyValueStore` + `toSchemaStore` (repository over a string store)
- Status: in_progress
- Mastery: 3/5
- Mental model: `KeyValueStore` is a service with `get/set` over strings (`localStorage` shape); `toSchemaStore(kv, schema)` wraps it so `get` returns `Option<Type>` and `set` takes `Type`, JSON-encoding through the schema (`DateFromString` round-trips). A layer that `yield*`s it gets `KeyValueStore` in its `R` and is satisfied later with `Layer.provide`.
- Why this project needs it: second `TodoRepository` implementation (browser persistence) without touching React code — the payoff of Phase 4.
- Can explain: `Effect.map` vs `Option.map` after `pipe` — asked and understood (2026-09-07); `E` of `get` (`KeyValueStoreError | SchemaError`) — missed first, understood after a hint.
- Can implement: yes, with one hint (2026-09-07).
- Can debug: read the tsc stack bottom-up after being shown how.
- Alternatives/trade-offs: manual `JSON.parse` + `Schema.decodeUnknownEffect` (same thing by hand); storing one key per todo (avoids the whole-list race, more keys to manage).
- Common confusion: believing a read has no error channel; `Option.getOrElse(() => [])` inferring `never[]`.
- Follow-up challenge: step 2 done 2026-09-07 (`catchTag` before `orDie`; learned that `SchemaError` on write is a defect, on read an expected case). Next: wire `layerStorage(() => localStorage)`.

### `Scope` and `Effect.acquireRelease` inside an atom (resource lifetime = mount lifetime)
- Status: in_progress
- Mastery: 3/5
- Mental model: `Scope` is a list of finalizers closed at the end; `acquireRelease` runs `acquire` now and parks `release` in the current `Scope`. `runtime.atom` supplies the `Scope` and closes it when the atom loses its last subscriber — one task later, and only if nobody re-subscribed in between (StrictMode / fast toggles keep the resource alive).
- Why this project needs it: a `storage` listener for cross-tab sync must be removed when the list unmounts, otherwise handlers accumulate and each one invalidates `todos`.
- Can explain: the leak without release and the deferred-removal behaviour — yes (2026-09-07).
- Can implement: with hints (release must return an effect; the service key is not the service).
- Can debug: read `A`/`R` of the failing effect type to locate the wrong atom and the non-effect `yield*` (guided).
- Alternatives/trade-offs: `useEffect` with `addEventListener` in the component (works, but the invalidation logic leaks into React); `Atom.make` with `get.addFinalizer` (no Effect, no `Scope`).
- Common confusion: `Ref.make` at module level is still an effect — each `yield*` makes a new `Ref`; `Ref.makeUnsafe` creates one now.
- Follow-up challenge: Phase 8 — an HTTP client layer whose connection/fetch is a scoped resource.

### `HttpApi` contract (`HttpApiGroup` / `HttpApiEndpoint` / `HttpApiSchema.status`)
- Status: done (Phase 8, 2026-09-08)
- Mastery: 3/5
- Mental model: one value describes paths, methods, params, payload, success and error schemas; server handlers and client methods are both derived from it, so a contract change is a compile error on both sides.
- Why this project needs it: the whole-list `save` repository cannot be served over HTTP; the browser needs five operations.
- Can explain: yes (path names the collection, method names the action; status lives on the schema passed to `error`).
- Can implement: yes after four correction rounds (paths, methods, statuses, `Void` successes, `Title` in payload).
- Can debug: partially (`OpenApi.fromApi` as the inspection tool).
- Alternatives/trade-offs: hand-written fetch + schemas (no shared contract); `Title` in the payload makes domain errors unreachable client-side.
- Common confusion: "REST singular for one resource"; statuses annotated on union members instead of the union.
- Follow-up challenge: add an endpoint end to end without hints (done as the exit check: `toggle` with `{ completed }` payload).

### `HttpApiClient.make` / `makeWith` and the transport policy (`HttpClient.retry`, `Effect.timeout`)
- Status: done (Phase 8, 2026-09-08)
- Mastery: 3/5
- Mental model: the generated client methods carry declared errors plus `HttpClientError | SchemaError`; a port service (`TodoClient`) wraps them with domain arguments and turns transport errors into defects. `transformClient` cannot widen `E`; `makeWith` takes a prepared `HttpClient` and pushes its extra `E` (`TimeoutError`) into the methods.
- Why this project needs it: atoms must not know request shapes; retry/timeout belong to the transport.
- Can explain: yes — retry only on `TransportError` because a timed-out request may already have been processed (`create`/`toggle` not idempotent); made `toggle` idempotent as the exit check.
- Can implement: yes (`pipe` + guard predicate); data-last `retry` infers `E` from the predicate — split the chain and use data-first to see the real types.
- Can debug: learned to read stacked TS errors (first error, first three lines; `never` probe; a `=>` in a value type means an unapplied function).
- Alternatives/trade-offs: `retryTransient` (cannot be narrowed); derived service interface via `Effect.Success<typeof make>` leaks `E` silently (happened with `TimeoutError`).
- Common confusion: `HttpClient.HttpClient` (raw fetch-like) vs the api client; data-last vs data-first inference.
- Follow-up challenge: per-endpoint retry policy (idempotent endpoints may retry timeouts).

### `Config` + `ConfigProvider` (a `Context.Reference` with `fromEnv` default)
- Status: done (Phase 8, 2026-09-08, SOLUTION MODE at the student's request)
- Mastery: 2/5
- Mental model: `Config.string(key)` is an effect that reads through the `ConfigProvider` reference; `withDefault` covers "missing"; `ConfigProvider.layer(fromEnvRecord(...))` overrides at the edge (browser: `import.meta.env`, `VITE_` prefix mapped explicitly).
- Why this project needs it: the same `layerHttp` must run in tests (no env, relative URLs via `layerTest`) and in the browser (`.env`).
- Can explain: partially (chose `Config` over `Context.Reference` himself).
- Can implement: not yet demonstrated unaided.
- Can debug: —
- Alternatives/trade-offs: `Context.Reference<string>` (no `ConfigError`, code-only override); layer factory `layerHttp(baseUrl)`.
- Common confusion: —
- Follow-up challenge: move the port of the server to `Config.port` (Phase 10 lists it).

### `it.live` vs `it.effect` (`TestClock`) with schedules and timeouts
- Status: done (Phase 8, 2026-09-08, mentor-driven)
- Mastery: 2/5
- Mental model: `it.effect` runs under `TestClock`; any `Schedule`/`Effect.sleep`/`Effect.timeout` waits for `TestClock.adjust`, otherwise the test hangs to the vitest timeout. `it.live` uses the real clock. A timeout test forks the call (`Effect.forkChild`), adjusts the clock, joins.
- Why this project needs it: the retry schedule froze the absolute-URL test.
- Can explain: seen, not yet reproduced by the student.
- Follow-up challenge: write a `TestClock`-driven retry test (currently `it.live`).

### Optimistic updates with atoms (`Atom.optimistic` + `Atom.optimisticFn`)
- Status: done (Phase 9 steps 1-2, 2026-09-09)
- Mastery: 4/5 (step 2 `remove` independent, first try)
- Mental model: `Atom.optimistic(source)` is a writable mirror of the source; `optimisticFn(mirror, { reducer, fn })` writes `reducer(current, input)` into the mirror with `waiting: true`, runs `fn`, on success refreshes the source (`get.refresh(self)` in the implementation), on failure drops back to the last source value. Derived atoms must read the mirror, not the source, or the UI never sees the provisional value. The inner `runtime.fn` must not carry `reactivityKeys` for the same source (double fetch). `fn` must be the atom itself; `(set) => atom` builds a new atom per call.
- Why this project needs it: toggle round trip on 3G was visibly slow; idempotent `toggle` (Phase 8 exit) makes the provisional value safe.
- Can explain: why derived atoms switch to the mirror in `filter.ts` (input changed, not logic); why the other mutations keep the key (nothing else refreshes the source) — after a nudge.
- Can debug: found the double `GET /todos` in Network unaided.
- Alternatives/trade-offs: manual `Atom.make` copy + rollback in the handler (more code, no `waiting` semantics); no optimism + skeleton state.
- Common confusion: reading the mirror in one consumer (hook) instead of at the derivation point; `!completed` on an input that already carries the target value; `OW` inferred as `void` when the reducer parameter is a bare destructuring pattern (fixed by annotating it).
- Follow-up challenge: optimistic `remove` written independently (step 2).

### `Effect.forEach` with `{ concurrency, discard }`
- Status: done (Phase 9 step 3, 2026-09-10, SOLUTION MODE)
- Mastery: 2/5
- Mental model: one effect over an iterable; sequential by default, `concurrency: n` keeps at most n children running, `"unbounded"` starts all; `discard: true` returns `void`. Fail-fast: the first failure interrupts the other in-flight children and the whole `forEach` fails with that error (unlike `Promise.all`, which lets the rest run).
- Why this project needs it: "Clear completed" is the first action that fans out into N requests.
- Can explain: student reached for `forEach` + `discard` unaided; chose `"unbounded"` (browser caps at ~6 per host, server unprotected) — to be argued.
- Can debug: not yet.
- Alternatives/trade-offs: one server endpoint `DELETE /todos?completed=true` (atomic, one request, no partial failure; the student sketched it as `removeAll` — parked); `Effect.all` for a fixed tuple; `Semaphore` when the bound must be shared across callers.
- Common confusion: dropping `reactivityKeys` on a plain `runtime.fn` (no optimistic wrapper refreshes the source); `(_: void) =>` vs the curried `runtime.fn<void>()`.
- Follow-up challenge: test that at most 3 requests are in flight (counting `HttpClient` wrapper + `TestClock`), or make the bound a `Config`.
