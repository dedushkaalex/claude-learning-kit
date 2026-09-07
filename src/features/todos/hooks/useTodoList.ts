import { useAtomMount, useAtomSet, useAtomValue } from "@effect/atom-react"
import {
  removeTodoAtom,
  renameTodoAtom,
  todosSyncAtom,
  toggleTodoAtom,
  visibleTodosAtom,
} from "@/entities/todo/todoStore"

export function useTodoList() {
  useAtomMount(todosSyncAtom)

  const todos = useAtomValue(visibleTodosAtom)
  const toggle = useAtomSet(toggleTodoAtom)
  const remove = useAtomSet(removeTodoAtom)
  const rename = useAtomSet(renameTodoAtom, { mode: "promise" })

  return { todos, toggle, remove, rename }
}
