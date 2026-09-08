import { Schema } from "effect"
import { HttpApi, HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi"
import { EmptyTitle, TitleTooLong, Todo, TodoId, TodoNotFound } from "./types"

const TitlePayload = Schema.Struct({
  title: Schema.String,
})

const InvalidTitle = Schema.Union([EmptyTitle, TitleTooLong]).pipe(HttpApiSchema.status(400))
const NotFound = TodoNotFound.pipe(HttpApiSchema.status(404))

const getTodos = HttpApiEndpoint.get("todos", "/todos", {
  success: Schema.Array(Todo),
})

const createTodo = HttpApiEndpoint.post("create", "/todos", {
  payload: TitlePayload,
  success: Todo,
  error: InvalidTitle,
})

const renameTodo = HttpApiEndpoint.patch("rename", "/todos/:id", {
  params: {
    id: TodoId,
  },
  payload: TitlePayload,
  success: Todo,
  error: [InvalidTitle, NotFound],
})

const toggleTodo = HttpApiEndpoint.patch("toggle", "/todos/:id/toggle", {
  params: {
    id: TodoId,
  },
  payload: Schema.Struct({
    completed: Schema.Boolean,
  }),
  success: Todo,
  error: NotFound,
})

const removeTodo = HttpApiEndpoint.delete("remove", "/todos/:id", {
  params: {
    id: TodoId,
  },
  error: NotFound,
})

const todoGroup = HttpApiGroup.make("todo")
  .add(createTodo)
  .add(removeTodo)
  .add(toggleTodo)
  .add(getTodos)
  .add(renameTodo)

export const todoApi = HttpApi.make("todoApi").add(todoGroup)
