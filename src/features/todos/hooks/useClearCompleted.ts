import { useAtom } from "@effect/atom-react"
import { clearCompletedAtom } from "@/entities/todo/todoStore"

export function useClearCompleted() {
  const [result, clear] = useAtom(clearCompletedAtom)

  return { waiting: result.waiting, clear }
}
