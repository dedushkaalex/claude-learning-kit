import { Effect, Layer, Match, Schema } from "effect"
import { TodoIdGenerator } from "./todoIdGenerator"
import { TodoRepository } from "./todoRepository"
import { createTodo, removeTodo, renameTodo, toggleTodo } from "./todoService"
import type { TodoId } from "./types"
import { KeyValueStore } from "effect/unstable/persistence"
import { AsyncResult, Atom, Reactivity } from "effect/unstable/reactivity"

const todoRepositoryLayer = Layer.provideMerge(
  TodoRepository.layerKeyValueStore,
  KeyValueStore.layerStorage(() => localStorage),
)

const runtime = Atom.runtime(Layer.merge(todoRepositoryLayer, TodoIdGenerator.layer))

export const todosAtom = runtime
  .atom(
    Effect.gen(function* () {
      const todos = yield* TodoRepository
      return yield* todos.all
    }),
  )
  .pipe(Atom.withReactivity(["todos"]))

export const todosSyncAtom = runtime.atom(
  Effect.gen(function* () {
    const reactivity = yield* Reactivity.Reactivity

    yield* Effect.acquireRelease(
      Effect.sync(() => {
        const handler = (event: StorageEvent) => {
          if (event.key === "todos") {
            reactivity.invalidateUnsafe(["todos"])
          }
        }
        window.addEventListener("storage", handler)
        return handler
      }),
      (handler) => Effect.sync(() => window.removeEventListener("storage", handler)),
    )
  }),
)

export const createTodoAtom = runtime.fn(createTodo, { reactivityKeys: ["todos"] })
export const removeTodoAtom = runtime.fn(removeTodo, { reactivityKeys: ["todos"] })
export const toggleTodoAtom = runtime.fn(toggleTodo, { reactivityKeys: ["todos"] })
export const renameTodoAtom = runtime.fn(
  ({ id, title }: { id: TodoId; title: string }) => renameTodo(id, title),
  { reactivityKeys: ["todos"] },
)

export const FilterSchema = Schema.Literals(["all", "active", "completed"])
export type Filter = typeof FilterSchema.Type

export const filterAtom = Atom.kvs({
  runtime,
  key: "filter",
  schema: FilterSchema,
  defaultValue: () => "all" as const,
})

export const visibleTodosAtom = Atom.make((get) => {
  const filter = get(filterAtom)

  return AsyncResult.map(get(todosAtom), (todos) =>
    Match.value(filter).pipe(
      Match.when("all", () => todos),
      Match.when("active", () => todos.filter((todo) => !todo.completed)),
      Match.when("completed", () => todos.filter((todo) => todo.completed)),
      Match.exhaustive,
    ),
  )
})

export const activeCountAtom = Atom.make((get) =>
  AsyncResult.map(get(todosAtom), (todos) => todos.filter((todo) => !todo.completed).length),
)
