import { Cause, Config, Context, Effect, Layer, Schedule, Schema } from "effect"
import { HttpClient, HttpClientError } from "effect/unstable/http"
import { HttpApiClient } from "effect/unstable/httpapi"
import { todoApi } from "./todoApi"
import { TodoId } from "./types"

type TransportError = HttpClientError.HttpClientError | Schema.SchemaError | Cause.TimeoutError

const transportAsDefect = <A, E extends { readonly _tag: string }, R>(
  self: Effect.Effect<A, E | TransportError, R>,
) => Effect.catchTag(self, ["HttpClientError", "SchemaError", "TimeoutError"], Effect.die)

const make = Effect.gen(function* () {
  const baseUrl = yield* Config.string("TODO_API_URL").pipe(Config.withDefault(""))
  const httpClient = (yield* HttpClient.HttpClient).pipe(
    HttpClient.transformResponse(Effect.timeout("5 seconds")),
    HttpClient.retry({
      while: (error) => error._tag === "HttpClientError" && error.reason._tag === "TransportError",
      times: 3,
      schedule: Schedule.exponential("100 millis"),
    }),
  )
  const client = yield* HttpApiClient.makeWith(todoApi, { httpClient, baseUrl })

  return {
    todos: () => client.todo.todos().pipe(transportAsDefect),
    create: (title: string) => client.todo.create({ payload: { title } }).pipe(transportAsDefect),
    toggle: (id: TodoId, completed: boolean) =>
      client.todo.toggle({ params: { id }, payload: { completed } }).pipe(transportAsDefect),
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
