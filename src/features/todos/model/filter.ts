import { Match, Schema } from "effect"
import { AsyncResult, Atom } from "effect/unstable/reactivity"
import { runtime } from "@/entities/todo/todoRuntime"
import { todosAtom } from "@/entities/todo/todoStore"

export const FilterSchema = Schema.Literals(["all", "active", "completed"])
export type Filter = typeof FilterSchema.Type

export const filterAtom = Atom.kvs({
  runtime,
  key: "filter",
  schema: FilterSchema,
  defaultValue: () => "all" as const,
})

export const visibleTodosAtom = Atom.make((get) => {
  const filter = get(filterAtom)

  return AsyncResult.map(get(todosAtom), (todos) =>
    Match.value(filter).pipe(
      Match.when("all", () => todos),
      Match.when("active", () => todos.filter((todo) => !todo.completed)),
      Match.when("completed", () => todos.filter((todo) => todo.completed)),
      Match.exhaustive,
    ),
  )
})

export const activeCountAtom = Atom.make((get) =>
  AsyncResult.map(get(todosAtom), (todos) => todos.filter((todo) => !todo.completed).length),
)
