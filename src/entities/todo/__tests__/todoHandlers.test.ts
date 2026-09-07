import { expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { HttpRouter, HttpServer } from "effect/unstable/http"
import { HttpApiTest } from "effect/unstable/httpapi"
import { todoHandlersLayer } from "../todoHandlers"
import { todoApi } from "../todoApi"
import { TodoIdGenerator } from "../todoIdGenerator"
import { TodoRepository } from "../todoRepository"
import { TodoId } from "../types"

const services = Layer.merge(TodoRepository.layerMemory, TodoIdGenerator.layerTest)
const testLayer = Layer.mergeAll(
  todoHandlersLayer.pipe(HttpRouter.provideRequest(services)),
  services,
  HttpServer.layerServices,
)

it.effect("создание, переключение, переименование и удаление проходят через контракт", () =>
  Effect.gen(function* () {
    const client = yield* HttpApiTest.groups(todoApi, ["todo"])

    const created = yield* client.todo.create({ payload: { title: "  first  " } })
    expect(created.title).toBe("first")

    const toggled = yield* client.todo.toggle({ params: { id: created.id } })
    expect(toggled).toEqual({ ...created, completed: true })

    const renamed = yield* client.todo.rename({
      params: { id: created.id },
      payload: { title: "renamed" },
    })
    expect(renamed.title).toBe("renamed")

    yield* client.todo.remove({ params: { id: created.id } })
    expect(yield* client.todo.todos()).toEqual([])
  }).pipe(Effect.scoped, Effect.provide(Layer.fresh(testLayer))),
)

it.effect("доменные ошибки доходят до клиента с тем же тегом", () =>
  Effect.gen(function* () {
    const client = yield* HttpApiTest.groups(todoApi, ["todo"])

    const empty = yield* Effect.flip(client.todo.create({ payload: { title: "   " } }))
    expect(empty._tag).toBe("EmptyTitle")

    const missing = yield* Effect.flip(client.todo.toggle({ params: { id: TodoId.make("nope") } }))
    expect(missing._tag).toBe("TodoNotFound")
  }).pipe(Effect.scoped, Effect.provide(Layer.fresh(testLayer))),
)
