# Curriculum — Effect v4 (RC) + React through a Todo List

> Ordered by prerequisites, not by documentation order.
> Student level: middle frontend developer, React already known.
> Target stack: `effect@rc` (4.0.0-rc.x), `@effect/atom-react@rc`, React 19, Vite, TypeScript strict, Vitest + `@effect/vitest@rc`.
> Later phases add `@effect/platform-browser@rc` (localStorage) and `@effect/platform-node@rc` (HTTP server).

## How to read this file

- Each phase has a **goal**, a list of **concepts**, and **exit criteria**.
- A phase is complete only when the exit criteria are met, not when the code runs.
- v4 is a release candidate. Modules under `effect/unstable/*` may still change between releases. Every version is pinned in `package.json`; an upgrade is a deliberate step, never a side effect.
- Where v4 differs from v3 (most online material is v3), the difference is called out with `v3 → v4`. The migration guides live in the `effect` repo under `migration/*.md`.

## Mastery scale

See `learning/progress.md`. A concept counts as learned at 4/5: implemented without hints and explained aloud.

---

## Phase 0 — Prerequisites and Project Orientation

**Goal:** a running Vite + React + TypeScript project with `effect@rc` installed, a test runner, and a typecheck that the student can run and read.

**Why first:** every later phase relies on strict types and on the dev loop (`dev`, `test`, `typecheck`). Effect without `strict: true` teaches wrong lessons.

### Concepts
- [ ] TypeScript pieces Effect leans on: generics with three type parameters, discriminated unions with `_tag`, `readonly`, `satisfies`, `never` as "impossible"
- [ ] Generator functions (`function*`, `yield*`) as plain JavaScript, before they appear inside `Effect.gen`
- [ ] Immutable updates of arrays/objects (the todo list is never mutated in place)
- [ ] `pipe` as function composition: `pipe(x, f, g)` is `g(f(x))`
- [ ] Repository layout: feature-based — `src/shared`, `src/entities`, `src/features`, `src/pages`, `src/app`
- [ ] Toolchain: pnpm, Vite, Vitest, `tsc --noEmit`, ESLint; the `rc` dist-tag on npm and why versions are pinned
- [ ] Fill in the `Commands` section of `AGENTS.md`

### Exit criteria
- `pnpm dev`, `pnpm test`, `pnpm typecheck` all run and the student can explain what each checks.
- The student can write a generator that yields three values and explain what `yield*` delegates to.
- The student can explain why `strict: true` matters for the `E` and `R` type parameters (without yet knowing what they are).

---

## Phase 1 — The Effect Value

**Goal:** understand `Effect<A, E, R>` as a *description* of a computation that is only executed by a runtime.

**Why now:** the todo domain (create, toggle, rename) will be written as effects before any React code exists. Without this mental model, everything later looks like magic.

### Concepts
- [ ] `Effect<A, E, R>`: success type, error type, requirements. Reading a signature aloud
- [ ] Constructors: `Effect.succeed`, `Effect.fail`, `Effect.sync`, `Effect.promise`, `Effect.tryPromise`
- [ ] Laziness: an effect is a value; nothing runs until `Effect.runPromise` / `Effect.runSync`
- [ ] `Effect.gen` and `yield*` as the main way to sequence effects
- [ ] `Effect.fn("name")` for named effectful functions (`v3 → v4`: preferred over returning `Effect.gen` from an arrow; it adds a span and better stack traces; combinators are passed as extra arguments, not through `.pipe`)
- [ ] Transformers: `Effect.map`, `Effect.flatMap`, `Effect.andThen`, `Effect.tap`, and when `pipe` is clearer than `gen`
- [ ] Yieldable values (`v3 → v4`): `Option`, `Result`, tagged errors can be yielded directly
- [ ] `Option` for "may be absent" vs `undefined`
- [ ] `Result` (`v3 → v4`: renamed from `Either`) for "computed, may have failed" as a plain value
- [ ] Running effects: `Effect.runPromise`, `Effect.runSync`, `Effect.runPromiseExit`; `Exit` as the outcome
- [ ] Logging: `Effect.log`, `Effect.logInfo`, log levels

### Application work
- Pure todo operations (`addTodo`, `toggleTodo`, `renameTodo`, `removeTodo`) written as effects over an immutable array, exercised from a scratch script and from tests.

### Exit criteria
- The student can explain, from a signature like `Effect<Todo, TodoNotFound, never>`, what a caller must handle.
- The student can rewrite a small `Effect.gen` block with `pipe` + `flatMap` and say which reads better and why.
- The student can explain why `Effect.promise(() => fetch(...))` created at module top level does not fire a request.

---

## Phase 2 — Typed Errors

**Goal:** model todo failures as typed values in the `E` channel and handle them selectively.

**Why now:** the repository service in Phase 3 has to declare what can go wrong. Errors are designed before the service, not patched in later.

### Concepts
- [ ] Expected errors vs defects: `Effect.fail` vs `Effect.die`; why a thrown exception inside `Effect.sync` becomes a defect
- [ ] `Schema.TaggedError` (`v3 → v4`: lives in core `effect`; also usable with `Data.TaggedError` when no schema is needed) for domain errors such as `TodoNotFound`, `EmptyTitle`
- [ ] Error union accumulation: how `E` grows through `yield*` and shrinks through handlers
- [ ] Handling: `Effect.catchTag`, `Effect.catchTags`, `Effect.catch` (`v3 → v4`: `catchAll` and friends were renamed; see `migration/error-handling.md`)
- [ ] `Effect.mapError`, `Effect.orElse`, `Effect.either` / `Effect.result` to reify an error as a value
- [ ] `Cause` (`v3 → v4`: flattened structure) and `Exit` when inspecting failures; `Cause.pretty`
- [ ] Retrying with `Effect.retry` and `Schedule` (introduced only to the extent needed for a flaky storage stub)
- [ ] Timeouts: `Effect.timeout` and the resulting error type

### Application work
- `TodoNotFound`, `EmptyTitle`, `TitleTooLong` errors; operations return them in `E`; a caller handles `TodoNotFound` and lets others propagate.

### Exit criteria
- The student can explain why `TodoNotFound` belongs in `E` but a broken `localStorage` implementation may belong in defects.
- The student can predict the `E` type of a composed effect before hovering in the editor.

---

## Phase 3 — Schema: Domain Model and Validation

**Goal:** define `Todo` once with `Schema` and get types, validation, encoding and decoding from that definition.

**Why now:** the same schema is reused by localStorage persistence (Phase 6) and the HTTP API (Phase 8). Defining it now avoids three parallel definitions later.

### Concepts
- [ ] `v3 → v4`: `Schema` is part of the core `effect` package; many combinators renamed (`migration/schema.md`)
- [ ] `Schema.Struct`, `Schema.String`, `Schema.Boolean`, `Schema.Literal`, `Schema.Array`, `Schema.optional`
- [ ] Type vs Encoded: `Schema.Schema.Type<typeof Todo>` and why `Date` encodes to a string
- [ ] Refinements/checks: `Schema.Trimmed.check(Schema.isNonEmpty())`, `Schema.maxLength`, custom checks with messages
- [ ] Branded ids: `Schema.brand("TodoId")` so a `TodoId` cannot be confused with a plain string
- [ ] `Schema.Class` for a `Todo` with a constructor and methods, vs plain `Struct`; when each fits
- [ ] Decoding as an effect: `Schema.decodeUnknownEffect`, `Schema.decodeUnknownSync`, `SchemaError` in the `E` channel
- [ ] Encoding: `Schema.encodeSync` / `Schema.encodeEffect` for storage and JSON
- [ ] Transformations: `Schema.DateTimeUtc` or a string ↔ Date transform for `createdAt`
- [ ] `Schema.TaggedError` revisited: errors that carry structured data

### Application work
- `Todo`, `TodoId`, `NewTodoInput` schemas; form input validated with a schema before it reaches domain operations.

### Exit criteria
- The student can explain the difference between the Type side and the Encoded side using `createdAt`.
- The student can add a new field with a validation rule and show which call sites fail to compile.

---

## Phase 4 — Services and Layers (Dependency Injection)

**Goal:** turn todo storage into a service with an interface, provide it through a `Layer`, and swap implementations without touching callers.

**Why now:** React components must not know whether todos live in memory, `localStorage`, or a server. The `R` channel is how Effect expresses that.

### Concepts
- [ ] The `R` channel: an effect that *requires* a `TodoRepository`
- [ ] `v3 → v4`: `Context.Service<Self, Shape>()("app/TodoRepository")` replaces `Context.Tag`, `Effect.Tag`, `Effect.Service` (`migration/services.md`); identifier naming convention `"app/path/Name"`
- [ ] Accessing a service: `yield* TodoRepository`
- [ ] `Layer.succeed` for a constant implementation, `Layer.effect` for one built by an effect, `Layer.scoped` when resources must be released
- [ ] `v3 → v4`: no auto-generated `.Default`; the class exposes `static readonly layer` built explicitly; `layerTest` naming for test variants
- [ ] Composing layers: `Layer.provide`, `Layer.provideMerge`, `Layer.merge`; reading the resulting `Layer<Out, E, In>` type
- [ ] `Effect.provide(layer)` vs `Effect.provideService`; where in the app the "wiring" happens (one place, at the edge)
- [ ] Layer memoization (`v3 → v4`: shared across `Effect.provide` calls; `migration/layer-memoization.md`); why a `Layer.effect` with a `console.log` runs once
- [ ] `Context.Reference` (`v3 → v4`: replaces `FiberRef`) for a service with a default value, e.g. the current `Clock` or a feature flag
- [ ] Which code is domain (pure todo rules) and which is infrastructure (storage)

### Application work
- `TodoRepository` service interface; `TodoRepository.layerMemory` implementation; a `TodoService` (domain rules) that depends on the repository; the app entry composes the layers.

### Exit criteria
- The student can swap `layerMemory` for a deliberately failing layer in one line and show that callers did not change.
- The student can explain why the repository interface returns effects rather than promises.
- The student can explain what the `In` parameter of `Layer<Out, E, In>` means using `TodoService.layer`.

---

## Phase 5 — Testing Effects

**Goal:** test domain logic and services without React, with deterministic time and a test layer.

**Why now:** the student now has enough surface (effects, errors, services) to need real tests, and every later phase adds behavior that must be verified.

### Concepts
- [ ] `@effect/vitest`: `it.effect`, `it.live`, `it.layer`, `it.scoped`
- [ ] Test services: `TestClock` from `effect/testing` and `TestClock.adjust`; why `it.effect` starts the clock at 0
- [ ] Asserting on errors: `Effect.flip`, `Effect.exit`, matching on `_tag`
- [ ] Test layers: `TodoRepository.layerTest` with seeded todos; providing it per test or per file
- [ ] Property tests with `it.prop` and `Schema.toArbitrary` for `Todo` (introduction only)
- [ ] `TestConsole` for asserting logs when relevant

### Application work
- Tests for `TodoService`: create with empty title fails with `EmptyTitle`; toggle of a missing id fails with `TodoNotFound`; `createdAt` comes from `Clock` and is controlled by `TestClock`.

### Exit criteria
- The student can write a failing test first for a new rule and make it pass.
- The student can explain what `it.effect` provides that plain `it` does not.

---

## Phase 6 — Effect in React: `@effect/atom-react`

**Goal:** connect the Effect world (services, layers, effects) to React components through atoms, without `useEffect` for data flow.

**Why now:** the domain and services exist and are tested. React is the last consumer, not the place where logic lives.

### Concepts
- [ ] Why not `useEffect` + `useState` + `Effect.runPromise`: cancellation, loading state, error state, duplicate runs
- [ ] `Atom.make` as reactive state; `useAtomValue`, `useAtomSet`, `useAtom`; `RegistryProvider`
- [ ] Derived atoms with `Atom.make((get) => ...)`: filtered list, counts; reading vs writing atoms
- [ ] `Atom.runtime(layer)`: one runtime per app built from the same layers used in tests
- [ ] `runtime.atom(effect)` for data that is read; `AsyncResult` and `AsyncResult.match` / `AsyncResult.builder` for `Initial | Success | Failure` rendering; the `waiting` flag
- [ ] `runtime.fn(...)` for mutations (add, toggle, remove); calling them from event handlers; `mode: "promise"` when a handler needs to await
- [ ] Refresh and invalidation: `useAtomRefresh`, reactivity keys, `Atom.keepAlive`
- [ ] Atom lifetime: when an atom is created, when it is garbage-collected, why a `family` is needed for per-todo atoms (`Atom.family`)
- [ ] `useAtomSuspense` and `Suspense` boundaries vs explicit `AsyncResult.match`; picking one for the app
- [ ] Interruption: what happens to an in-flight effect when the component unmounts
- [ ] Rendering errors: mapping tagged errors from `AsyncResult.Failure` to UI messages; error boundaries for defects

### Application work
- `todosAtom` reads from `TodoService`; `addTodoAtom`, `toggleTodoAtom`, `removeTodoAtom` mutate and invalidate; filter atom (`all | active | completed`) derived on the client; the form validates input through `Schema` before dispatching.

### Exit criteria
- The student can explain why the runtime is created once at module level and what would break if it were created inside a component.
- The student can explain the three states of `AsyncResult` and show where each renders.
- The student can remove a todo while its toggle is in flight and explain what the runtime does with the interrupted effect.

---

## Phase 7 — Persistence in the Browser

**Goal:** make todos survive reload by swapping the repository layer for a `localStorage`-backed one, with the same tests still passing.

**Why now:** this is the first real payoff of Phase 4. The React code does not change.

### Concepts
- [ ] `KeyValueStore` from `effect/unstable/persistence`; `BrowserKeyValueStore.layerLocalStorage` from `@effect/platform-browser`
- [ ] `KeyValueStore.toSchemaStore` (or manual encode/decode with `Schema`) to store `ReadonlyArray<Todo>` as JSON
- [ ] `TodoRepository.layerLocalStorage` built with `Layer.effect` and `Layer.provide(BrowserKeyValueStore.layerLocalStorage)`
- [ ] Handling corrupt stored data: `SchemaError` → fallback to empty list, logged, not crashed
- [ ] `KeyValueStore.layerMemory` as the test double so `layerLocalStorage` logic is testable in Node
- [ ] `Atom.kvs` for small UI preferences (current filter) as a contrast to repository-level persistence
- [ ] Scope and resources: `Layer.scoped`, `Effect.acquireRelease`, finalizers (`migration/scope.md`); illustrated with a `storage` event subscription for cross-tab sync

### Application work
- Todos persist across reloads; the filter persists via `Atom.kvs`; corrupt JSON in `localStorage` results in an empty list and a logged warning.

### Exit criteria
- The student can explain which layer changed and prove with `git diff` that `src/features` and
  `src/pages` did not.
- The student can explain when a finalizer runs and demonstrate it with the cross-tab subscription.

---

## Phase 8 — HTTP API with `HttpApi`: Server and Client from One Definition

**Goal:** move todos to a small Node server defined with `HttpApi`, and derive a type-safe client for the React app from the same definition.

**Why now:** the domain schema (Phase 3), typed errors (Phase 2), and layers (Phase 4) are exactly what `HttpApi` composes. The student sees why those were designed the way they were.

### Concepts
- [ ] `v3 → v4`: HTTP lives in `effect/unstable/http` and `effect/unstable/httpapi`; platform packages provide runtime layers only
- [ ] Definition: `HttpApi.make`, `HttpApiGroup.make`, `HttpApiEndpoint.get/post/patch/del` with `success`, `error`, `payload`, `params` schemas
- [ ] Mapping domain errors to status codes with `HttpApiSchema` annotations (`TodoNotFound` → 404, validation → 400)
- [ ] Implementation: `HttpApiBuilder.group` and `handlers.handle`; handlers that depend on `TodoService` through `R`
- [ ] Serving: `HttpApiBuilder.layer`, `HttpRouter.serve`, `NodeHttpServer.layer`, `Layer.launch`, `NodeRuntime.runMain`
- [ ] OpenAPI generation from the same definition (as a check that the contract is explicit)
- [ ] Client: `HttpApiClient.make(Api, ...)`, `FetchHttpClient.layer`, `HttpClient.mapRequest` for base URL
- [ ] `TodoRepository.layerHttp` implemented on top of the client; the third interchangeable layer
- [ ] Resilience at the client: `HttpClient.retryTransient`, `Effect.timeout`, mapping transport errors into the repository error type
- [ ] Testing handlers in memory with `HttpApiTest` (no network)
- [ ] Config: `Config.string("API_URL")` and `ConfigProvider` for the base URL

### Application work
- `apps/server` with `GET/POST/PATCH/DELETE /todos`; the React app uses `layerHttp`; tests cover handlers in memory and the client against a test server.

### Exit criteria
- The student can change the `Todo` schema and enumerate every compile error on both server and client without running anything.
- The student can explain which layer receives the request on the server and which layer sends it on the client, and where the schema is validated on each side.

---

## Phase 9 — Concurrency and Structured Lifetimes

**Goal:** handle several in-flight operations correctly: optimistic updates, deduplication, cancellation of stale requests, parallel batch operations.

**Why now:** the app now talks to a server, so races become visible: double toggle, remove during rename, "clear completed" over many todos.

### Concepts
- [ ] Fibers: `Effect.fork` and its renamed variants (`v3 → v4`: `migration/forking.md`), `Fiber.join`, `Fiber.interrupt`
- [ ] Structured concurrency: a child fiber does not outlive its parent scope; what `Effect.forkScoped` changes
- [ ] `Effect.forEach` with `{ concurrency }`, `Effect.all`, `Effect.race`
- [ ] Interruption semantics: `Effect.onInterrupt`, `Effect.uninterruptible`, why a mutation may need `uninterruptible`
- [ ] Optimistic updates with atoms: write locally, run the effect, roll back on `Failure`
- [ ] Deduplicating identical requests: `Effect.cached`, `Effect.cachedWithTTL`, or a `Cache`; when an atom already gives dedupe for free
- [ ] `Semaphore` / `Effect.withConcurrency` to bound parallel requests
- [ ] `Stream` introduction only if the server adds live updates (SSE): `Stream.fromEventListener`, `Stream.runForEach` into an atom
- [ ] Fiber keep-alive (`v3 → v4`: `migration/fiber-keep-alive.md`) for the server process lifetime

### Application work
- "Clear completed" removes N todos with bounded concurrency and one loading indicator; toggling is optimistic with rollback; a rename in flight is interrupted by a remove.

### Exit criteria
- The student can draw the fiber tree for "clear completed" and say which fibers are interrupted when the user navigates away.
- The student can explain the difference between an interrupted effect and a failed one, and how each shows up in `AsyncResult`.

---

## Phase 10 — Observability and Production Concerns

**Goal:** make failures diagnosable: structured logs, spans, config, and a clean error surface for the UI.

**Why now:** the system now has three layers (UI, client, server). Without spans and logs, debugging a slow or failing request is guesswork.

### Concepts
- [ ] Spans from `Effect.fn("...")` and `Effect.withSpan`; annotations with `Effect.annotateCurrentSpan`
- [ ] Log annotations with `Effect.annotateLogs`; log levels through `Logger` and `Context.Reference`
- [ ] Exporting traces to a local OpenTelemetry collector (introduction only; optional)
- [ ] `Config` for the server port, API URL, feature flags; `ConfigProvider.fromEnv` and a test provider
- [ ] Error surface: separate expected errors (`E`) shown to users from defects reported to logs; `Cause.pretty` for defects
- [ ] Build: `pnpm build` for the client, a Node entry for the server; ESM only (`v3 → v4`: no CommonJS build)
- [ ] Upgrading Effect within the RC line: reading the changelog, running typecheck, fixing renames

### Exit criteria
- The student can follow one request from a click to the server handler through span names in logs.
- The student can explain which errors a user sees, which go to logs, and why.

---

## Phase 11 — Independent Implementation

**Goal:** implement a full vertical feature with minimal guidance and defend the design.

**Why now:** every prior phase was scaffolded. Mastery is shown by choosing the abstractions unaided.

### Tasks (student picks one, mentor picks the next)
- [ ] Due dates with reminders: `Schema` field, `Clock`-based "overdue" derived atom, tested with `TestClock`
- [ ] Tags/projects: a second aggregate, a new `HttpApiGroup`, a new repository method, client-side filter
- [ ] Undo of the last mutation: an in-memory history service with a `Layer`, bounded size, interruption-safe
- [ ] Offline mode: `layerLocalStorage` as a write-behind cache in front of `layerHttp`, with a sync effect
- [ ] Debug an unfamiliar failure injected by the mentor (wrong layer wiring, swallowed defect, leaked fiber)
- [ ] Refactor a deliberately flawed implementation provided by the mentor

### Exit criteria
- The feature works, is tested with `@effect/vitest`, and the diff touches domain, service, and UI in the expected places.
- The student can explain each abstraction chosen, the simpler alternative rejected, and the trade-off.
- The student can solve a related small problem with substantially less guidance than in Phase 6.

---

## Deliberately excluded (for now)

- `Stream` beyond the SSE demo, `PubSub`, `Queue`, `STM`
- `@effect/sql` on the server (in-memory server repository is enough for the learning goal)
- `Rpc` (`effect/unstable/rpc`) as an alternative to `HttpApi`; mentioned as a contrast in Phase 8 only
- Server-side rendering and `HydrationBoundary`
- Workers and `@effect/platform-browser` worker APIs

These become optional extensions after Phase 11.
