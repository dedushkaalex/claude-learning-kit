import { useAtomSet, useAtomValue } from "@effect/atom-react"
import { removeTodoAtom, toggleTodoAtom, visibleTodosAtom } from "../../../entities/todo/todoStore"

export function useTodoList() {
  const todos = useAtomValue(visibleTodosAtom)
  const toggle = useAtomSet(toggleTodoAtom)
  const remove = useAtomSet(removeTodoAtom)

  return { todos, toggle, remove }
}
