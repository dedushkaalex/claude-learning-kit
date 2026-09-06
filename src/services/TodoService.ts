import { Effect } from "effect"
import * as Todo from "../domain/todo"
import { TodoRepository } from "./TodoRepository"

const updateTodos = Effect.fn("updateTodos")(function* <E, R>(
  step: (todos: ReadonlyArray<Todo.Todo>) => Effect.Effect<ReadonlyArray<Todo.Todo>, E, R>,
) {
  const todoRepository = yield* TodoRepository
  const todos = yield* todoRepository.all
  const next = yield* step(todos)

  yield* todoRepository.save(next)

  return next
})

export const createTodo = Effect.fn("createTodo")((title: string) =>
  updateTodos((todos) => Todo.addTodo(todos, title)),
)

export const toggleTodo = Effect.fn("toggleTodo")((id: Todo.TodoId) =>
  updateTodos((todos) => Todo.toggleTodo(todos, id)),
)

export const renameTodo = Effect.fn("renameTodo")((id: Todo.TodoId, title: string) =>
  updateTodos((todos) => Todo.renameTodo(todos, id, title)),
)

export const removeTodo = Effect.fn("removeTodo")((id: Todo.TodoId) =>
  updateTodos((todos) => Todo.removeTodo(todos, id)),
)
