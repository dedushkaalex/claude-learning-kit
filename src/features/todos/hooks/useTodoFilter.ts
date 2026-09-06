import { useAtom } from "@effect/atom-react"
import { filterAtom } from "../../../entities/todo/todoStore"

export function useTodoFilter() {
  return useAtom(filterAtom)
}
