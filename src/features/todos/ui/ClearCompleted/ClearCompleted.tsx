import { useClearCompleted } from "../../hooks/useClearCompleted"
import styles from "./ClearCompleted.module.css"

export function ClearCompleted() {
  const { waiting, clear } = useClearCompleted()

  return (
    <button type="button" className={styles.button} disabled={waiting} onClick={() => clear()}>
      {waiting ? "Clearing…" : "Clear completed"}
    </button>
  )
}
