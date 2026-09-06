import { Effect, Layer } from "effect"
import { Atom } from "effect/unstable/reactivity"
import { TodoIdGenerator } from "./todoIdGenerator"
import { TodoRepository } from "./todoRepository"
import { createTodo, removeTodo, toggleTodo } from "./todoService"

const runtime = Atom.runtime(Layer.merge(TodoRepository.layerMemory, TodoIdGenerator.layer))

export const todosAtom = runtime
  .atom(
    Effect.gen(function* () {
      const todos = yield* TodoRepository

      return yield* todos.all
    }),
  )
  .pipe(Atom.withReactivity(["todos"]))

export const createTodoAtom = runtime.fn(createTodo, { reactivityKeys: ["todos"] })
export const removeTodoAtom = runtime.fn(removeTodo, { reactivityKeys: ["todos"] })
export const toggleTodoAtom = runtime.fn(toggleTodo, { reactivityKeys: ["todos"] })
