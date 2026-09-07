import { expect, layer } from "@effect/vitest"
import { Cause, Effect, Exit, Layer } from "effect"
import { EmptyTitle, TodoId, TodoNotFound } from "@/entities/todo/types"
import { TodoIdGenerator } from "../todoIdGenerator"
import { TodoRepository } from "../todoRepository"
import { createTodo, removeTodo, renameTodo, toggleTodo } from "../todoService"

const testLayer = Layer.merge(TodoRepository.layerMemory, TodoIdGenerator.layerTest)

layer(testLayer)("createTodo", (it) => {
  it.effect("создаёт todo и сохраняет список в репозиторий", () =>
    Effect.gen(function* () {
      const repository = yield* TodoRepository

      const created = yield* createTodo("Купить воду")

      expect(created).toEqual({
        id: "todo-0",
        title: "Купить воду",
        completed: false,
        createdAt: new Date(0),
      })
      expect(yield* repository.all).toEqual([created])
    }),
  )

  it.effect("при EmptyTitle ничего не сохраняет: save не вызывается", () =>
    Effect.gen(function* () {
      const repository = yield* TodoRepository
      const before = yield* repository.all

      const error = yield* Effect.flip(createTodo("   "))

      expect(error).toBeInstanceOf(EmptyTitle)
      expect(yield* repository.all).toEqual(before)
    }),
  )

  it.effect("toggle, rename, remove работают поверх сохранённого списка", () =>
    Effect.gen(function* () {
      const repository = yield* TodoRepository
      const first = yield* createTodo("first")
      const second = yield* createTodo("second")

      const toggled = yield* toggleTodo(first.id)
      expect(toggled).toEqual({ ...first, completed: true })

      const renamed = yield* renameTodo(first.id, "  renamed  ")
      expect(renamed).toEqual({ ...toggled, title: "renamed" })

      yield* removeTodo(first.id)
      const all = yield* repository.all
      expect(all).toContainEqual(second)
      expect(all.some((todo) => todo.id === first.id)).toBe(false)
    }),
  )

  it.effect("TodoNotFound из домена проходит наружу и ничего не сохраняет", () =>
    Effect.gen(function* () {
      const repository = yield* TodoRepository
      const before = yield* repository.all

      const error = yield* Effect.flip(toggleTodo(TodoId.make("nope")))

      expect(error).toBeInstanceOf(TodoNotFound)
      expect(yield* repository.all).toEqual(before)
    }),
  )

  it.layer(
    Layer.merge(
      Layer.succeed(TodoRepository, {
        all: Effect.die(new Error("storage is down")),
        save: () => Effect.void,
      }),
      TodoIdGenerator.layerTest,
    ),
  )("со сломанным хранилищем", (it) => {
    it.effect("toggleTodo умирает дефектом, а не TodoNotFound", () =>
      Effect.gen(function* () {
        const exit = yield* Effect.exit(toggleTodo(TodoId.make("any")))

        expect(Exit.isFailure(exit)).toBe(true)
        if (Exit.isFailure(exit)) {
          expect(Cause.hasDies(exit.cause)).toBe(true)
          expect(Cause.hasFails(exit.cause)).toBe(false)
        }
      }),
    )
  })
})
