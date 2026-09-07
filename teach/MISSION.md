# Mission: Effect v4 + React through a real todo app

## Why
Alex wants to build production front-ends where async work, errors and dependencies are typed and testable, instead of ad-hoc hooks and untyped promises. The todo app in this repository is the vehicle; the skill is being able to reason about Effect-based state (atoms, layers, resources) confidently enough to design it, not just copy it.

## Success looks like
- Can predict, for any mount/unmount sequence, whether a resource in an atom is acquired or released, and explain why.
- Can pick between plain state, derived atoms, `runtime.fn` and scoped resources for a new feature without a hint.
- Can swap a repository implementation (memory, `localStorage`, HTTP) and prove the UI did not change.
- Can explain to a colleague why a library defers teardown, using an example outside Effect.

## Constraints
- Learns in Russian, reads answers aloud; lessons and references are in Russian, code and terms in English.
- Short sessions; one tangible idea per lesson; examples first in plain JavaScript, then in Effect.
- Prefers to write the application code personally; the mentor verifies and questions.

## Out of scope
- Effect v3 APIs and migration trivia.
- Server-side Effect beyond what Phase 8 (`HttpApi`) needs.
