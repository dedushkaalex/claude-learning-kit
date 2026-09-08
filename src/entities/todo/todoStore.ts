import { Effect } from "effect"
import { Atom } from "effect/unstable/reactivity"
import { TodoClient } from "./todoClient"
import { runtime } from "./todoRuntime"
import type { TodoId } from "./types"

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
  ({ id, completed }: { id: TodoId; completed: boolean }) =>
    Effect.flatMap(TodoClient, (client) => client.toggle(id, completed)),
  { reactivityKeys: ["todos"] },
)
export const renameTodoAtom = runtime.fn(
  (input: { id: TodoId; title: string }) =>
    Effect.flatMap(TodoClient, (client) => client.rename(input)),
  { reactivityKeys: ["todos"] },
)
