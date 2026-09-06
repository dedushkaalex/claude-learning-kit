import { Schema } from "effect"

export const TodoId = Schema.String.pipe(Schema.brand("TodoId"))
export type TodoId = typeof TodoId.Type

export const Title = Schema.Trim.check(Schema.isNonEmpty(), Schema.isMaxLength(100))

export const Todo = Schema.Struct({
  id: TodoId,
  completed: Schema.Boolean,
  title: Title,
  createdAt: Schema.DateFromString,
})

export type Todo = typeof Todo.Type

export class TodoNotFound extends Schema.TaggedError<TodoNotFound>()("TodoNotFound", {
  id: TodoId,
}) {}

export class EmptyTitle extends Schema.TaggedError<EmptyTitle>()("EmptyTitle", {}) {}
export class TitleTooLong extends Schema.TaggedError<TitleTooLong>()("TitleTooLong", {
  max: Schema.Number,
}) {}
