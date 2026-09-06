import { Effect } from "effect"
import * as TodoRules from "./todoRules"
import { TodoRepository } from "./todoRepository"
import type { Todo, TodoId } from "./types"

const updateTodos = Effect.fn("updateTodos")(function* <E, R>(
  step: (todos: ReadonlyArray<Todo>) => Effect.Effect<ReadonlyArray<Todo>, E, R>,
) {
  const todoRepository = yield* TodoRepository
  const todos = yield* todoRepository.all
  const next = yield* step(todos)

  yield* todoRepository.save(next)

  return next
})

export const createTodo = Effect.fn("createTodo")((title: string) =>
  updateTodos((todos) => TodoRules.addTodo(todos, title)),
)

export const toggleTodo = Effect.fn("toggleTodo")((id: TodoId) =>
  updateTodos((todos) => TodoRules.toggleTodo(todos, id)),
)

export const renameTodo = Effect.fn("renameTodo")((id: TodoId, title: string) =>
  updateTodos((todos) => TodoRules.renameTodo(todos, id, title)),
)

export const removeTodo = Effect.fn("removeTodo")((id: TodoId) =>
  updateTodos((todos) => TodoRules.removeTodo(todos, id)),
)
