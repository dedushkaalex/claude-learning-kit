import { useState } from "react"
import { EditableText } from "@/shared/ui/EditableText/EditableText"
import { ErrorMessage } from "@/shared/ui/ErrorMessage/ErrorMessage"
import { EmptyTitle, TitleTooLong, TodoNotFound, type Todo } from "../../types"
import styles from "./TodoCard.module.css"

type TodoCardProps = {
  todo: Todo
  onToggle?: (({ id, completed }: { id: Todo["id"]; completed: boolean }) => void) | undefined
  onRemove?: ((id: Todo["id"]) => void) | undefined
  onRename?: ((id: Todo["id"], title: string) => Promise<unknown>) | undefined
}

function renameErrorMessage(error: unknown) {
  if (error instanceof EmptyTitle) return "Title cannot be empty"
  if (error instanceof TitleTooLong) return `Title must be at most ${error.max} characters`
  if (error instanceof TodoNotFound) return "This task no longer exists"
  return "Could not rename. Try again."
}

export function TodoCard({ todo, onToggle, onRemove, onRename }: TodoCardProps) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [renameError, setRenameError] = useState<unknown>(null)
  const className = todo.completed ? `${styles.item} ${styles.completed}` : styles.item

  const startEditing = () => {
    setRenameError(null)
    setEditing(true)
  }

  const submitTitle = async (title: string) => {
    if (!onRename) {
      setEditing(false)
      return
    }
    setSaving(true)
    setRenameError(null)
    try {
      await onRename(todo.id, title)
      setEditing(false)
    } catch (error) {
      setRenameError(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <li className={className}>
      <label className={styles.check}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={todo.completed}
          onChange={() => onToggle?.({ id: todo.id, completed: !todo.completed })}
          aria-label={`Toggle ${todo.title}`}
        />
        <span className={styles.mark} aria-hidden="true" />
      </label>
      <span className={styles.title}>
        <EditableText
          value={todo.title}
          editing={editing}
          saving={saving}
          error={
            renameError ? <ErrorMessage>{renameErrorMessage(renameError)}</ErrorMessage> : null
          }
          editLabel={`Rename ${todo.title}`}
          onEdit={startEditing}
          onCancel={() => setEditing(false)}
          onSubmit={submitTitle}
        >
          <span className={styles.text}>{todo.title}</span>
        </EditableText>
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
