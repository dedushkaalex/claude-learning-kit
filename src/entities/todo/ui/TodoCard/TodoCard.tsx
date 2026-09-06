import type { Todo } from "../../types"
import styles from "./TodoCard.module.css"

type TodoCardProps = {
  todo: Todo
  onToggle?: ((id: Todo["id"]) => void) | undefined
  onRemove?: ((id: Todo["id"]) => void) | undefined
}

export function TodoCard({ todo, onToggle, onRemove }: TodoCardProps) {
  const className = todo.completed ? `${styles.item} ${styles.completed}` : styles.item

  return (
    <li className={className}>
      <label className={styles.check}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={todo.completed}
          onChange={() => onToggle?.(todo.id)}
          aria-label={`Toggle ${todo.title}`}
        />
        <span className={styles.mark} aria-hidden="true" />
      </label>
      <span className={styles.title}>
        <span className={styles.text}>{todo.title}</span>
      </span>
      <button
        type="button"
        className={styles.remove}
        onClick={() => onRemove?.(todo.id)}
        aria-label={`Remove ${todo.title}`}
      >
        ×
      </button>
    </li>
  )
}
