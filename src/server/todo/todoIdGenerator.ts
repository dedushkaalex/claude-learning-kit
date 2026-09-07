import { Context, Effect, Layer, Ref } from "effect"
import { TodoId } from "@/entities/todo/types"

export class TodoIdGenerator extends Context.Service<
  TodoIdGenerator,
  { readonly next: Effect.Effect<TodoId> }
>()("app/TodoIdGenerator") {
  static readonly layer = Layer.succeed(TodoIdGenerator, {
    next: Effect.sync(() => TodoId.make(crypto.randomUUID())),
  })

  static readonly layerTest = Layer.effect(
    TodoIdGenerator,
    Effect.gen(function* () {
      const counter = yield* Ref.make(0)

      return {
        next: Effect.gen(function* () {
          const prev = yield* Ref.getAndUpdate(counter, (x) => x + 1)

          return TodoId.make(`todo-${prev}`)
        }),
      }
    }),
  )
}
