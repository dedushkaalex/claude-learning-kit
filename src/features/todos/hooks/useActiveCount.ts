import { useAtomValue } from "@effect/atom-react"
import { activeCountAtom } from "../model/filter"

export function useActiveCount() {
  return useAtomValue(activeCountAtom)
}
