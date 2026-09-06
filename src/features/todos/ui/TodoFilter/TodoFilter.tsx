import type { Filter } from "../../../../entities/todo/todoStore"
import { useTodoFilter } from "../../hooks/useTodoFilter"
import styles from "./TodoFilter.module.css"

const options: ReadonlyArray<{ value: Filter; label: string }> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
]

export function TodoFilter() {
  const [filter, setFilter] = useTodoFilter()

  return (
    <div className={styles.filter} role="group" aria-label="Show">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={styles.button}
          aria-pressed={filter === option.value}
          onClick={() => setFilter(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
