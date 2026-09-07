import { DateTime, Effect, Schema } from "effect"
import { TodoIdGenerator } from "./todoIdGenerator"
import { EmptyTitle, Title, TitleTooLong, Todo, TodoId, TodoNotFound } from "@/entities/todo/types"

export const findTodo = Effect.fn("findTodo")(function* (todos: ReadonlyArray<Todo>, id: TodoId) {
  const todo = todos.find((todo) => todo.id === id)
  if (todo === undefined) return yield* new TodoNotFound({ id })
  return todo
})

const replaceTodo = (
  todos: ReadonlyArray<Todo>,
  id: TodoId,
  update: (todo: Todo) => Todo,
): ReadonlyArray<Todo> => todos.map((todo) => (todo.id === id ? update(todo) : todo))

const validateTitle = (title: string) =>
  Schema.decodeEffect(Title)(title).pipe(
    Effect.mapError(() =>
      title.trim().length === 0 ? new EmptyTitle() : new TitleTooLong({ max: 100 }),
    ),
  )

export const newTodo = Effect.fn("newTodo")(function* (title: string) {
  const idGenerator = yield* TodoIdGenerator
  const id = yield* idGenerator.next
  const createdAt = yield* DateTime.nowAsDate
  const validTitle = yield* validateTitle(title)

  const todo: Todo = { id, completed: false, title: validTitle, createdAt }
  return todo
})

export const addTodo = Effect.fn("addTodo")(function* (todos: ReadonlyArray<Todo>, title: string) {
  const todo = yield* newTodo(title)
  const added: ReadonlyArray<Todo> = [...todos, todo]
  return added
})

export const toggleTodo = Effect.fn("toggleTodo")(function* (
  todos: ReadonlyArray<Todo>,
  id: TodoId,
) {
  yield* findTodo(todos, id)
  return replaceTodo(todos, id, (todo) => ({ ...todo, completed: !todo.completed }))
})

export const renameTodo = Effect.fn("renameTodo")(function* (
  todos: ReadonlyArray<Todo>,
  id: TodoId,
  title: string,
) {
  yield* findTodo(todos, id)

  const validTitle = yield* validateTitle(title)

  return replaceTodo(todos, id, (todo) => ({ ...todo, title: validTitle }))
})

export const removeTodo = Effect.fn("removeTodo")(function* (
  todos: ReadonlyArray<Todo>,
  id: TodoId,
) {
  yield* findTodo(todos, id)

  return todos.filter((todo) => todo.id !== id)
})
