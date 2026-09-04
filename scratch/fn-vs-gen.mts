import { Cause, Effect } from "effect"

const viaGen = (id: string) =>
  Effect.gen(function* () {
    yield* Effect.fail(new Error(`not found: ${id}`))
  })

const viaFn = Effect.fn("toggleTodo")(function* (id: string) {
  yield* Effect.fail(new Error(`not found: ${id}`))
})

const clearCompleted = Effect.fn("clearCompleted")(function* () {
  yield* viaFn("42")
})

const handleClick = Effect.fn("handleClick")(function* () {
  yield* clearCompleted()
})

const show = (label: string, program: Effect.Effect<void, Error>) =>
  Effect.runPromiseExit(program).then((exit) => {
    console.log(`\n===== ${label} =====`)
    if (exit._tag === "Failure") console.log(Cause.pretty(exit.cause))
  })

await show("Effect.gen", viaGen("42"))
await show("Effect.fn", viaFn("42"))
await show("Effect.fn, три уровня вызовов", handleClick())
