import { Config, Context, Effect, Layer, Schema } from "effect"
import { HttpClientError } from "effect/unstable/http"
import { HttpApiClient } from "effect/unstable/httpapi"
import { todoApi } from "./todoApi"
import { TodoId } from "./types"

type TransportError = HttpClientError.HttpClientError | Schema.SchemaError

const transportAsDefect = <A, E extends { readonly _tag: string }, R>(
  self: Effect.Effect<A, E | TransportError, R>,
) => Effect.catchTag(self, ["HttpClientError", "SchemaError"], Effect.die)

const make = Effect.gen(function* () {
  const baseUrl = yield* Config.string("TODO_API_URL").pipe(Config.withDefault(""))
  const client = yield* HttpApiClient.make(todoApi, { baseUrl })

  return {
    todos: () => client.todo.todos().pipe(transportAsDefect),
    create: (title: string) => client.todo.create({ payload: { title } }).pipe(transportAsDefect),
    toggle: (id: TodoId) => client.todo.toggle({ params: { id } }).pipe(transportAsDefect),
    rename: ({ id, title }: { id: TodoId; title: string }) =>
      client.todo.rename({ params: { id }, payload: { title } }).pipe(transportAsDefect),
    remove: (id: TodoId) => client.todo.remove({ params: { id } }).pipe(transportAsDefect),
  }
})

export class TodoClient extends Context.Service<TodoClient, Effect.Success<typeof make>>()(
  "TodoClient",
) {
  static readonly layer = Layer.effect(TodoClient, make)
}
