import { Effect } from "effect"
import { Atom, AsyncResult } from "effect/unstable/reactivity"
import { TodoClient } from "./todoClient"
import { runtime } from "./todoRuntime"
import type { TodoId } from "./types"

export const todosAtom = runtime
  .atom(Effect.flatMap(TodoClient, (client) => client.todos()))
  .pipe(Atom.withReactivity(["todos"]))
export const optimisticAtom = Atom.optimistic(todosAtom)

export const createTodoAtom = runtime.fn(
  (title: string) => Effect.flatMap(TodoClient, (client) => client.create(title)),
  { reactivityKeys: ["todos"] },
)

export const clearCompletedAtom = runtime.fn<void>()(
  () =>
    Effect.gen(function* () {
      const client = yield* TodoClient
      const todos = yield* client.todos()
      const completed = todos.filter((todo) => todo.completed)
      yield* Effect.forEach(completed, (todo) => client.remove(todo.id), {
        concurrency: 3,
        discard: true,
      })
    }),
  { reactivityKeys: ["todos"] },
)

export const removeTodoAtom = Atom.optimisticFn(optimisticAtom, {
  reducer: (current, id: TodoId) =>
    AsyncResult.map(current, (todos) => todos.filter((todo) => todo.id !== id)),
  fn: runtime.fn((id: TodoId) => Effect.flatMap(TodoClient, (client) => client.remove(id))),
})

type ToggleInput = { id: TodoId; completed: boolean }

export const toggleTodoAtom = Atom.optimisticFn(optimisticAtom, {
  reducer: (current, { id, completed }: ToggleInput) =>
    AsyncResult.map(current, (todos) =>
      todos.map((todo) => (todo.id === id ? { ...todo, completed } : todo)),
    ),
  fn: runtime.fn(({ id, completed }: ToggleInput) =>
    Effect.flatMap(TodoClient, (client) => client.toggle(id, completed)),
  ),
})

export const renameTodoAtom = runtime.fn(
  (input: { id: TodoId; title: string }) =>
    Effect.flatMap(TodoClient, (client) => client.rename(input)),
  { reactivityKeys: ["todos"] },
)
