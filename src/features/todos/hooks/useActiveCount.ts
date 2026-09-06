import { useAtomValue } from "@effect/atom-react"
import { activeCountAtom } from "@/entities/todo/todoStore"

export function useActiveCount() {
  return useAtomValue(activeCountAtom)
}
