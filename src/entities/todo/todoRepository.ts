import { Context, Effect, Layer, Ref } from "effect"
import type { Todo } from "./types"

export class TodoRepository extends Context.Service<
  TodoRepository,
  {
    all: Effect.Effect<ReadonlyArray<Todo>>
    save: (todos: ReadonlyArray<Todo>) => Effect.Effect<void>
  }
>()("TodoRepository") {
  static readonly layerMemory = Layer.effect(
    TodoRepository,
    Effect.gen(function* () {
      const storage = yield* Ref.make<ReadonlyArray<Todo>>([])

      return {
        all: Ref.get(storage),
        save: (todos: ReadonlyArray<Todo>) => Ref.set(storage, todos),
      }
    }),
  )
}
