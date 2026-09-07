import { Context, Effect, Layer, Option, Ref, Schema } from "effect"
import { Todo } from "@/entities/todo/types"
import { KeyValueStore } from "effect/unstable/persistence"

const TODOS_STORAGE_KEY = "todos"

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

  static readonly layerKeyValueStore = Layer.effect(
    TodoRepository,
    Effect.gen(function* () {
      const storage = yield* KeyValueStore.KeyValueStore
      const schemaStore = KeyValueStore.toSchemaStore(storage, Schema.Array(Todo))

      return {
        all: schemaStore.get(TODOS_STORAGE_KEY).pipe(
          Effect.map(Option.getOrElse<ReadonlyArray<Todo>>(() => [])),
          Effect.catchTag("SchemaError", () =>
            Effect.logWarning("stored todos are corrupt, starting empty").pipe(
              Effect.as<ReadonlyArray<Todo>>([]),
            ),
          ),
          Effect.orDie,
        ),

        save: (todos: ReadonlyArray<Todo>) =>
          schemaStore.set(TODOS_STORAGE_KEY, todos).pipe(Effect.orDie),
      }
    }),
  )
}
