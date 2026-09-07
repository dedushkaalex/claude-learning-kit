import { ConfigProvider, Effect, Layer, Match, Schema } from "effect"
import { TodoClient } from "./todoClient"
import type { TodoId } from "./types"
import { FetchHttpClient } from "effect/unstable/http"
import { KeyValueStore } from "effect/unstable/persistence"
import { AsyncResult, Atom } from "effect/unstable/reactivity"

const browserConfig = ConfigProvider.layer(
  ConfigProvider.fromEnvRecord({ TODO_API_URL: import.meta.env.VITE_TODO_API_URL }),
)

const todoClientLayer = TodoClient.layer.pipe(
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(browserConfig),
)

const runtime = Atom.runtime(
  Layer.merge(
    todoClientLayer,
    KeyValueStore.layerStorage(() => localStorage),
  ),
)

export const todosAtom = runtime
  .atom(Effect.flatMap(TodoClient, (client) => client.todos()))
  .pipe(Atom.withReactivity(["todos"]))

export const createTodoAtom = runtime.fn(
  (title: string) => Effect.flatMap(TodoClient, (client) => client.create(title)),
  { reactivityKeys: ["todos"] },
)
export const removeTodoAtom = runtime.fn(
  (id: TodoId) => Effect.flatMap(TodoClient, (client) => client.remove(id)),
  { reactivityKeys: ["todos"] },
)
export const toggleTodoAtom = runtime.fn(
  (id: TodoId) => Effect.flatMap(TodoClient, (client) => client.toggle(id)),
  { reactivityKeys: ["todos"] },
)
export const renameTodoAtom = runtime.fn(
  (input: { id: TodoId; title: string }) =>
    Effect.flatMap(TodoClient, (client) => client.rename(input)),
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
