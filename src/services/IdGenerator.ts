import { Context, Effect, Layer, Ref } from "effect"
import { TodoId } from "../domain/TodoId"

export class IdGenerator extends Context.Service<
  IdGenerator,
  { readonly next: Effect.Effect<TodoId> }
>()("app/IdGenerator") {
  static readonly layer = Layer.succeed(IdGenerator, {
    next: Effect.sync(() => TodoId.make(crypto.randomUUID())),
  })

  static readonly layerTest = Layer.effect(
    IdGenerator,
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
