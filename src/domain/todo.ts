import { Effect } from "effect";

export type Todo = {
  readonly id: string;
  readonly completed: boolean;
  readonly title: string;
}

export const addTodo = Effect.fn("addTodo")(function* (todos: ReadonlyArray<Todo>, title: string) {
  const newTodo = yield* Effect.sync(() => ({
    id: crypto.randomUUID(),
    title,
    completed: false
  }))

  return [...todos, newTodo]
});

export const toggleTodo = Effect.fn("toggleTodo")(function* (todos: ReadonlyArray<Todo>, id: string) {

  const todoIdx = todos.findIndex(({ id: todoId }) => todoId === id)

  if (todoIdx === -1) {
    return yield* Effect.fail("TodoNotFound" as const)
  }


  return todos.map((todo, index) => {
    if (todoIdx !== index) return todo;
    return {
      ...todo,
      completed: !todo.completed
    }
  })
})
