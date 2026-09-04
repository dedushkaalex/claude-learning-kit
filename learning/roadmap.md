# Roadmap — Todo List on Effect v4 (RC) + React

## Current Phase
Phase 0 — Prerequisites and Project Orientation

## Current Goal
Scaffold the project (Vite + React + TypeScript strict, `effect@rc`, Vitest + `@effect/vitest@rc`) and fill in the `Commands` section of `AGENTS.md`.

## Sequence

Each entry maps a curriculum phase to the application increment that makes it necessary. The increment is the deliverable; the concepts are the reason it exists.

| # | Phase | Application increment | Key concepts | Status |
|---|---|---|---|---|
| 0 | Prerequisites | Empty app runs; `dev`, `test`, `typecheck` work; versions pinned to `rc` | TS strict, generators, `pipe`, toolchain | done (mentor scaffolded at student's request) |
| 1 | The Effect value | Pure todo operations as effects, run from a script and tests | `Effect<A, E, R>`, `Effect.gen`, `Effect.fn`, `Option`, `Result`, running effects | done (Option/Result deferred to when needed) |
| 2 | Typed errors | `TodoNotFound`, `EmptyTitle`, `TitleTooLong`; selective handling | `Schema.TaggedError`, `catchTag`, `catch`, `Cause`, `Exit` | done (retry/timeout deferred) |
| 3 | Schema | `Todo`, `TodoId`, `NewTodoInput` schemas; form input decoded | `Schema.Struct`/`Class`, brands, checks, decode/encode, Type vs Encoded | in_progress |
| 4 | Services and layers | `TodoRepository` interface + `layerMemory`; `TodoService` with domain rules; wiring at the entry point | `Context.Service`, `Layer.effect`/`succeed`, `Layer.provide`, `R` channel, memoization | not_started |
| 5 | Testing | Tests for `TodoService` with a test layer and controlled time | `@effect/vitest`, `it.effect`, `it.layer`, `TestClock` | not_started |
| 6 | React integration | List, add, toggle, remove, filter in React via atoms | `Atom.runtime`, `runtime.atom`/`fn`, `AsyncResult`, hooks, `Atom.family`, interruption on unmount | not_started |
| 7 | Browser persistence | `layerLocalStorage`; filter saved via `Atom.kvs`; cross-tab sync | `KeyValueStore`, `BrowserKeyValueStore`, `Layer.scoped`, finalizers | not_started |
| 8 | HTTP API | Node server with `HttpApi`; `layerHttp` client in the React app | `HttpApiGroup`/`Endpoint`/`Builder`, `HttpApiClient`, `FetchHttpClient`, `HttpApiTest`, `Config` | not_started |
| 9 | Concurrency | Optimistic toggle with rollback; bounded "clear completed"; stale request cancellation | fibers, structured concurrency, `forEach` concurrency, interruption, `Effect.cached` | not_started |
| 10 | Observability | Spans and structured logs across click → server; config for port and URL | `Effect.fn` spans, `annotateLogs`, `Config`, error surface | not_started |
| 11 | Independent implementation | One full feature end to end (due dates, tags, undo, or offline mode) | all of the above, chosen unaided | not_started |

## Feature Map

The same application feature is revisited at increasing depth. This table tracks each feature's current implementation level.

| Feature | Phase introduced | Concepts | Status |
|---|---|---|---|
| Create todo with validated title | 1, 3 | `Effect.fn`, `Schema` checks, `EmptyTitle` | not_started |
| Toggle / rename / remove | 1, 2 | error channel, `TodoNotFound` | not_started |
| Todo model with `createdAt` | 3, 5 | `Schema.Class`, `Clock`, `TestClock` | not_started |
| Storage behind an interface | 4 | `Context.Service`, `Layer` | not_started |
| React list with loading/error states | 6 | `AsyncResult`, `runtime.atom` | not_started |
| Filter all/active/completed | 6, 7 | derived atoms, `Atom.kvs` | not_started |
| Persist across reload | 7 | `KeyValueStore`, layer swap | not_started |
| Cross-tab sync | 7 | `Layer.scoped`, finalizers | not_started |
| Server API + typed client | 8 | `HttpApi`, `HttpApiClient` | not_started |
| Optimistic updates with rollback | 9 | fibers, interruption | not_started |
| Clear completed (bulk) | 9 | `Effect.forEach` concurrency | not_started |
| Request tracing | 10 | spans, log annotations | not_started |
| Student-chosen feature | 11 | — | not_started |

## Repository layout (target, grows phase by phase)

```
src/
  domain/        Todo schemas, domain errors, pure rules          (Phases 2–3)
  services/      TodoRepository, TodoService, layers              (Phase 4+)
  runtime/       Atom.runtime and app layer composition           (Phase 6)
  ui/            React components and atoms                       (Phase 6)
src/__tests__/   @effect/vitest tests (student chose co-location)  (Phase 1+)
apps/server/     HttpApi definition, handlers, Node entry         (Phase 8)
```

The layout is introduced only when a phase needs a folder. Phase 1 may live in a single file.

## Layer swap milestones

The central design lesson is that `TodoRepository` has three interchangeable implementations and the UI never changes:

1. `layerMemory` — Phase 4
2. `layerLocalStorage` — Phase 7
3. `layerHttp` — Phase 8

Each swap is verified with `git diff` showing that `src/ui` is untouched.

## Versioning rules

- Install with the `rc` dist-tag (`effect@rc`, `@effect/atom-react@rc`, `@effect/vitest@rc`, `@effect/platform-browser@rc`, `@effect/platform-node@rc`) and pin exact versions in `package.json`.
- All `@effect/*` packages must share one version; upgrade them together.
- Modules under `effect/unstable/*` (http, httpapi, persistence) may change between RC releases. When something breaks after an upgrade, check the `effect` repo `migration/*.md` and changelog before searching the web; most search results describe v3.
- Do not mix v3 docs with v4 code: `Context.Tag`, `Effect.Service`, `Either`, `@effect/platform` imports of `HttpApi`, and `@effect-atom/atom-react` are all v3-era.

## Rules

- Do not advance merely because code works.
- Prefer dependency order: no `Layer` before typed errors, no atoms before services.
- Revisit weak concepts through `/challenge` before the next phase.
- Avoid introducing a concept before its prerequisite.
- One implementation step per turn.
- The student writes all application code; the mentor reviews, tests, and asks.
