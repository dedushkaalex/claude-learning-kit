import { useAtomSet, useAtomValue } from "@effect/atom-react"
import {
  removeTodoAtom,
  renameTodoAtom,
  toggleTodoAtom,
  visibleTodosAtom,
} from "@/entities/todo/todoStore"

export function useTodoList() {
  const todos = useAtomValue(visibleTodosAtom)
  const toggle = useAtomSet(toggleTodoAtom)
  const remove = useAtomSet(removeTodoAtom)
  const rename = useAtomSet(renameTodoAtom, { mode: "promise" })

  return { todos, toggle, remove, rename }
}
