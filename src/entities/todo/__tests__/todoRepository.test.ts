import { expect, layer } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { addTodo } from "../todoRules"
import { TodoIdGenerator } from "../todoIdGenerator"
import { TodoRepository } from "../todoRepository"

layer(TodoRepository.layerMemory)("TodoRepository.layerMemory", (it) => {
  it.effect("save заменяет список целиком, all возвращает сохранённое", () =>
    Effect.gen(function* () {
      const repository = yield* TodoRepository
      const todos = yield* addTodo([], "first").pipe(Effect.provide(TodoIdGenerator.layerTest))

      yield* repository.save(todos)
      yield* repository.save(todos)

      expect(yield* repository.all).toEqual(todos)
    }),
  )

  it.effect("Effect.provide того же слоя внутри блока переиспользует построенный экземпляр", () =>
    Effect.gen(function* () {
      const shared = yield* Effect.flatMap(TodoRepository, (repository) => repository.all).pipe(
        Effect.provide(TodoRepository.layerMemory),
      )

      expect(shared).toHaveLength(1)
    }),
  )

  it.effect("Layer.fresh строит слой заново: список пуст", () =>
    Effect.gen(function* () {
      const fresh = yield* Effect.flatMap(TodoRepository, (repository) => repository.all).pipe(
        Effect.provide(Layer.fresh(TodoRepository.layerMemory)),
      )

      expect(fresh).toEqual([])
    }),
  )
})
