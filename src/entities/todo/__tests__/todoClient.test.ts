import { expect, it } from "@effect/vitest"
import { NodeHttpServer } from "@effect/platform-node"
import { Cause, ConfigProvider, Effect, Exit, Layer } from "effect"
import { HttpRouter } from "effect/unstable/http"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { todoApi } from "../todoApi"
import { TodoClient } from "../todoClient"
import { todoHandlersLayer } from "@/server/todo/todoHandlers"
import { TodoIdGenerator } from "@/server/todo/todoIdGenerator"
import { TodoRepository } from "@/server/todo/todoRepository"
import { TodoId, TodoNotFound } from "../types"

const services = Layer.merge(TodoRepository.layerMemory, TodoIdGenerator.layerTest)
const server = HttpRouter.serve(
  HttpApiBuilder.layer(todoApi).pipe(Layer.provide(todoHandlersLayer)),
).pipe(Layer.provide(services))
const testLayer = Layer.merge(server, TodoClient.layer).pipe(
  Layer.provide(NodeHttpServer.layerTest),
)

it.effect("the http client drives the whole todo lifecycle through the server", () =>
  Effect.gen(function* () {
    const client = yield* TodoClient

    const created = yield* client.create("  first  ")
    expect(created.title).toBe("first")

    const toggled = yield* client.toggle(created.id)
    expect(toggled).toEqual({ ...created, completed: true })

    const renamed = yield* client.rename({ id: created.id, title: "renamed" })
    expect(renamed.title).toBe("renamed")

    yield* client.remove(created.id)
    expect(yield* client.todos()).toEqual([])
  }).pipe(Effect.scoped, Effect.provide(Layer.fresh(testLayer))),
)

it.effect("domain errors come back typed, not as transport failures", () =>
  Effect.gen(function* () {
    const client = yield* TodoClient

    const notFound = yield* Effect.flip(client.toggle(TodoId.make("missing")))
    expect(notFound).toBeInstanceOf(TodoNotFound)

    const empty = yield* Effect.flip(client.create("   "))
    expect(empty._tag).toBe("EmptyTitle")
  }).pipe(Effect.scoped, Effect.provide(Layer.fresh(testLayer))),
)

it.effect("an absolute base url from the environment breaks the test transport", () =>
  Effect.gen(function* () {
    const client = yield* TodoClient
    const exit = yield* Effect.exit(client.todos())

    expect(Exit.isFailure(exit)).toBe(true)
    if (Exit.isFailure(exit)) {
      expect(Cause.hasDies(exit.cause)).toBe(true)
      expect(Cause.pretty(exit.cause)).toContain("http://localhost:3000/http://127.0.0.1")
    }
  }).pipe(
    Effect.scoped,
    Effect.provide(
      Layer.fresh(
        testLayer.pipe(
          Layer.provide(
            ConfigProvider.layer(
              ConfigProvider.fromEnvRecord({ TODO_API_URL: "http://localhost:3000" }),
            ),
          ),
        ),
      ),
    ),
  ),
)
