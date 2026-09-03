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
- Mastery: 2/5
- Mental model: swaps `A` and `E` so an expected error can be `yield*`-ed.
- Can implement: yes, with a direction hint.
