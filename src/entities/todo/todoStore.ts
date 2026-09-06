import { Effect, Layer, Match } from "effect"
import { AsyncResult, Atom } from "effect/unstable/reactivity"
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

export type Filter = "all" | "active" | "completed"
export const filterAtom = Atom.make<Filter>("all")

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
