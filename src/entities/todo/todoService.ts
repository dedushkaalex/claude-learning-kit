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

const pickTodo = (todos: ReadonlyArray<Todo>, id: TodoId) =>
  TodoRules.findTodo(todos, id).pipe(Effect.orDie)

export const createTodo = Effect.fn("createTodo")(function* (title: string) {
  const todo = yield* TodoRules.newTodo(title)
  yield* updateTodos((todos) => Effect.succeed([...todos, todo]))
  return todo
})

export const toggleTodo = Effect.fn("toggleTodo")(function* (id: TodoId) {
  const todos = yield* updateTodos((todos) => TodoRules.toggleTodo(todos, id))
  return yield* pickTodo(todos, id)
})

export const renameTodo = Effect.fn("renameTodo")(function* (id: TodoId, title: string) {
  const todos = yield* updateTodos((todos) => TodoRules.renameTodo(todos, id, title))
  return yield* pickTodo(todos, id)
})

export const removeTodo = Effect.fn("removeTodo")((id: TodoId) =>
  updateTodos((todos) => TodoRules.removeTodo(todos, id)).pipe(Effect.asVoid),
)
