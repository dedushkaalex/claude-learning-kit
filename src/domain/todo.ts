import { Effect, Schema } from "effect"

export const TodoId = Schema.String.pipe(Schema.brand("TodoId"))

export const Title = Schema.Trim.check(Schema.isNonEmpty(), Schema.isMaxLength(100))

export const Todo = Schema.Struct({
  id: TodoId,
  completed: Schema.Boolean,
  title: Title,
  createdAt: Schema.DateFromString,
})

export type Todo = typeof Todo.Type
export type TodoId = typeof TodoId.Type

export class TodoNotFound extends Schema.TaggedError<TodoNotFound>()("TodoNotFound", {
  id: TodoId,
}) {}

export class EmptyTitle extends Schema.TaggedError<EmptyTitle>()("EmptyTitle", {}) {}
export class TitleTooLong extends Schema.TaggedError<TitleTooLong>()("TitleTooLong", {
  max: Schema.Number,
}) {}

const findTodo = Effect.fn("findTodo")(function* (todos: ReadonlyArray<Todo>, id: TodoId) {
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
    Effect.mapError(() => {
      return title.trim().length === 0 ? new EmptyTitle() : new TitleTooLong({ max: 100 })
    }),
  )

export const addTodo = Effect.fn("addTodo")(function* (todos: ReadonlyArray<Todo>, title: string) {
  const id = yield* Effect.sync(() => TodoId.make(crypto.randomUUID()))
  const createdAt = yield* Effect.sync(() => new Date())

  const decodedTitle = yield* validateTitle(title)

  const added = [...todos, { id, completed: false, title: decodedTitle, createdAt: createdAt }]
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

  const decodedTitle = yield* validateTitle(title)

  return replaceTodo(todos, id, (todo) => ({ ...todo, title: decodedTitle }))
})

export const removeTodo = Effect.fn("removeTodo")(function* (
  todos: ReadonlyArray<Todo>,
  id: TodoId,
) {
  yield* findTodo(todos, id)

  return todos.filter((t) => t.id !== id)
})
