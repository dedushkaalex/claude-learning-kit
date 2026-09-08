import { expect, it } from "@effect/vitest"
import { NodeHttpServer } from "@effect/platform-node"
import { Cause, ConfigProvider, Effect, Exit, Fiber, Layer } from "effect"
import { TestClock } from "effect/testing"
import { HttpClient, HttpClientError, HttpClientRequest, HttpRouter } from "effect/unstable/http"
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

    const toggled = yield* client.toggle(created.id, true)
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

    const notFound = yield* Effect.flip(client.toggle(TodoId.make("missing"), true))
    expect(notFound).toBeInstanceOf(TodoNotFound)

    const empty = yield* Effect.flip(client.create("   "))
    expect(empty._tag).toBe("EmptyTitle")
  }).pipe(Effect.scoped, Effect.provide(Layer.fresh(testLayer))),
)

it.live("an absolute base url from the environment breaks the test transport", () =>
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

const flakyClient = (counter: { attempts: number }, failures: number) =>
  Layer.effect(
    HttpClient.HttpClient,
    Effect.gen(function* () {
      const real = yield* HttpClient.HttpClient
      return HttpClient.transformResponse(real, (response) =>
        Effect.suspend(() => {
          counter.attempts += 1
          return counter.attempts <= failures
            ? Effect.fail(
                new HttpClientError.HttpClientError({
                  reason: new HttpClientError.TransportError({
                    request: HttpClientRequest.get("/todos"),
                    description: "simulated connection refused",
                  }),
                }),
              )
            : response
        }),
      )
    }),
  )

const flakyLayer = (counter: { attempts: number }, failures: number) =>
  Layer.merge(server, TodoClient.layer.pipe(Layer.provide(flakyClient(counter, failures)))).pipe(
    Layer.provide(NodeHttpServer.layerTest),
  )

it.live("a request that could not connect is retried until it succeeds", () => {
  const counter = { attempts: 0 }
  return Effect.gen(function* () {
    const client = yield* TodoClient

    expect(yield* client.todos()).toEqual([])
    expect(counter.attempts).toBe(3)
  }).pipe(Effect.scoped, Effect.provide(Layer.fresh(flakyLayer(counter, 2))))
})

it.live("after the retry budget is spent the transport failure becomes a defect", () => {
  const counter = { attempts: 0 }
  return Effect.gen(function* () {
    const client = yield* TodoClient

    const exit = yield* Effect.exit(client.todos())
    expect(Exit.isFailure(exit) && Cause.hasDies(exit.cause)).toBe(true)
    expect(counter.attempts).toBe(4)
  }).pipe(Effect.scoped, Effect.provide(Layer.fresh(flakyLayer(counter, 10))))
})

const slowClient = (counter: { attempts: number }) =>
  Layer.effect(
    HttpClient.HttpClient,
    Effect.map(HttpClient.HttpClient, (real) =>
      HttpClient.transformResponse(real, (response) =>
        Effect.suspend(() => {
          counter.attempts += 1
          return response.pipe(Effect.delay("1 minute"))
        }),
      ),
    ),
  )

it.effect("a request that hangs past the timeout becomes a defect and is not retried", () => {
  const counter = { attempts: 0 }
  return Effect.gen(function* () {
    const client = yield* TodoClient
    const fiber = yield* Effect.forkChild(Effect.exit(client.todos()))
    yield* TestClock.adjust("5 seconds")
    const exit = yield* Fiber.join(fiber)

    expect(Exit.isFailure(exit) && Cause.hasDies(exit.cause)).toBe(true)
    expect(counter.attempts).toBe(1)
  }).pipe(
    Effect.scoped,
    Effect.provide(
      Layer.fresh(
        Layer.merge(server, TodoClient.layer.pipe(Layer.provide(slowClient(counter)))).pipe(
          Layer.provide(NodeHttpServer.layerTest),
        ),
      ),
    ),
  )
})
