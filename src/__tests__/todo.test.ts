import { expect, it } from '@effect/vitest'
import { Effect, pipe } from 'effect'
import { addTodo, toggleTodo } from '../domain/todo';

it.effect("Добавить 2 todo", () => Effect.gen(function* () {
  const todos = yield* pipe(
    addTodo([], "first"),
    Effect.flatMap((one) => addTodo(one, "second")),
    Effect.flatMap((todos) => toggleTodo(todos, todos[0].id))
  )
  expect(todos.map(({title, completed}) => ({title, completed}))).toEqual([{title: "first", completed: true}, {title: "second", completed: false}])
}))

it.effect("Toggle несуществующей задачи", () => Effect.gen(function* () {
  const testId = "__";

  const result = yield* pipe(
    addTodo([], "first"),
    Effect.flatMap((one) => addTodo(one, "second")),
    Effect.flatMap((todos) => Effect.flip(toggleTodo(todos, testId)))
  )

  expect(result).toEqual("TodoNotFound")
}))
