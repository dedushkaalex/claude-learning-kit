import { expect, it } from "@effect/vitest"
import { Effect, pipe, Schema } from "effect"
import {
  addTodo,
  EmptyTitle,
  removeTodo,
  renameTodo,
  TitleTooLong,
  Todo,
  TodoId,
  TodoNotFound,
  toggleTodo,
} from "../domain/todo"

it.effect("Добавить 2 todo", () =>
  Effect.gen(function* () {
    const todos = yield* pipe(
      addTodo([], "first"),
      Effect.flatMap((one) => addTodo(one, "second")),
      Effect.flatMap((todos) => toggleTodo(todos, todos[0].id)),
    )
    expect(todos.map(({ title, completed }) => ({ title, completed }))).toEqual([
      { title: "first", completed: true },
      { title: "second", completed: false },
    ])
  }),
)

it.effect("Toggle несуществующей задачи", () =>
  Effect.gen(function* () {
    const testId = TodoId.make("__")

    const result = yield* pipe(
      addTodo([], "first"),
      Effect.flatMap((one) => addTodo(one, "second")),
      Effect.flatMap((todos) => Effect.flip(toggleTodo(todos, testId))),
    )

    expect(result).toBeInstanceOf(TodoNotFound)
  }),
)

it.effect("Ошибка при создании с пустым title", () =>
  Effect.gen(function* () {
    const result = yield* addTodo([], "").pipe(
      Effect.catchTag("EmptyTitle", () => Effect.succeed(new EmptyTitle())),
    )

    expect(result).toBeInstanceOf(EmptyTitle)
  }),
)

it.effect("Rename: меняет title у существующей задачи", () =>
  Effect.gen(function* () {
    const todos = yield* pipe(
      addTodo([], "Купить пиво"),
      Effect.flatMap((todos) => renameTodo(todos, todos[0].id, "  Купить воду  ")),
    )

    expect(todos).toHaveLength(1)
    expect(todos[0].title).toBe("Купить воду")
  }),
)

it.effect("Rename: catchTag снимает только TodoNotFound", () =>
  Effect.gen(function* () {
    const todos = yield* pipe(
      addTodo([], "Купить пиво"),
      Effect.flatMap((todos) =>
        renameTodo(todos, TodoId.make("nope"), "Купить воду").pipe(
          Effect.catchTag("TodoNotFound", (error) => {
            expect(error.id).toBe("nope")
            return Effect.succeed(todos)
          }),
        ),
      ),
    )

    expect(todos.map(({ title }) => title)).toEqual(["Купить пиво"])
  }),
)

it.effect("Remove: удаляем существующий todo", () =>
  Effect.gen(function* () {
    const todos = yield* pipe(
      addTodo([], "Title"),
      Effect.tap((t) => Effect.sync(() => expect(t.length).toEqual(1))),
      Effect.flatMap((t) => removeTodo(t, t[0].id)),
    )

    expect(todos.length).toEqual(0)
  }),
)

it.effect("Remove: несуществующий id даёт TodoNotFound с этим id", () =>
  Effect.gen(function* () {
    const error = yield* pipe(
      addTodo([], "Title"),
      Effect.flatMap((todos) => Effect.flip(removeTodo(todos, TodoId.make("nope")))),
    )

    expect(error).toBeInstanceOf(TodoNotFound)
    expect(error.id).toBe("nope")
  }),
)

it.effect("Rename: EmptyTitle проходит сквозь catchTag для TodoNotFound", () =>
  Effect.gen(function* () {
    const error = yield* pipe(
      addTodo([], "Title"),
      Effect.flatMap((todos) =>
        renameTodo(todos, todos[0].id, "   ").pipe(
          Effect.catchTag("TodoNotFound", () => Effect.succeed(todos)),
          Effect.flip,
        ),
      ),
    )

    expect(error).toBeInstanceOf(EmptyTitle)
  }),
)

it.effect("Add: заголовок из одних пробелов даёт EmptyTitle", () =>
  Effect.gen(function* () {
    const error = yield* Effect.flip(addTodo([], "   "))

    expect(error).toBeInstanceOf(EmptyTitle)
  }),
)

it.effect("Add: заголовок длиннее 100 символов даёт TitleTooLong с max", () =>
  Effect.gen(function* () {
    const error = yield* Effect.flip(addTodo([], "a".repeat(101)))

    expect(error).toBeInstanceOf(TitleTooLong)
    expect(error).toMatchObject({ max: 100 })
  }),
)

it.effect("Add: ровно 100 символов после trim проходит", () =>
  Effect.gen(function* () {
    const todos = yield* addTodo([], `  ${"a".repeat(100)}  `)

    expect(todos[0].title).toHaveLength(100)
  }),
)

it.effect("Schema: encode даёт строку в createdAt, decode возвращает Date", () =>
  Effect.gen(function* () {
    const [todo] = yield* addTodo([], "Купить воду")

    const encoded = Schema.encodeSync(Todo)(todo)
    expect(typeof encoded.createdAt).toBe("string")
    expect(encoded.createdAt).toBe(todo.createdAt.toISOString())

    const decoded = yield* Schema.decodeUnknownEffect(Todo)(JSON.parse(JSON.stringify(encoded)))
    expect(decoded.createdAt).toBeInstanceOf(Date)
    expect(decoded).toEqual(todo)
  }),
)

it.effect("Schema: строка вместо даты в localStorage не проходит decode", () =>
  Effect.gen(function* () {
    const error = yield* Effect.flip(
      Schema.decodeUnknownEffect(Todo)({
        id: "1",
        completed: false,
        title: "Купить воду",
        createdAt: "not a date",
      }),
    )

    expect(error).toBeInstanceOf(Schema.SchemaError)
  }),
)
