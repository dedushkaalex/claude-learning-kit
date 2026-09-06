import { AsyncResult } from "effect/unstable/reactivity"
import { useActiveCount } from "../../hooks/useActiveCount"
import styles from "./TodoCount.module.css"

export function TodoCount() {
  const count = useActiveCount()

  return AsyncResult.builder(count)
    .onSuccess((value) => (
      <span className={styles.count}>
        {value} {value === 1 ? "item" : "items"} left
      </span>
    ))
    .orNull()
}
