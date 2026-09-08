import { useAtom } from "@effect/atom-react"
import { filterAtom } from "../model/filter"

export function useTodoFilter() {
  return useAtom(filterAtom)
}
