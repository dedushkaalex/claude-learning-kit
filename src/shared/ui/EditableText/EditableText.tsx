import { useId, type FocusEvent, type FormEvent, type KeyboardEvent, type ReactNode } from "react"
import styles from "./EditableText.module.css"

type EditableTextProps = {
  value: string
  editing: boolean
  saving?: boolean | undefined
  error?: ReactNode
  editLabel: string
  onEdit: () => void
  onCancel: () => void
  onSubmit: (value: string) => void
  children: ReactNode
}

export function EditableText({
  value,
  editing,
  saving = false,
  error,
  editLabel,
  onEdit,
  onCancel,
  onSubmit,
  children,
}: EditableTextProps) {
  const hintId = useId()

  if (!editing) {
    return (
      <span className={styles.display} onDoubleClick={onEdit}>
        {children}
        <button type="button" className={styles.editButton} onClick={onEdit} aria-label={editLabel}>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path
              d="M11.5 2.5l2 2L5 13H3v-2l8.5-8.5z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </span>
    )
  }

  const selectAll = (event: FocusEvent<HTMLInputElement>) => {
    event.currentTarget.select()
  }

  const cancelOnEscape = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") onCancel()
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (saving) return
    const next = String(new FormData(event.currentTarget).get("value") ?? "")
    if (next === value) {
      onCancel()
      return
    }
    onSubmit(next)
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <input
        name="value"
        className={styles.input}
        defaultValue={value}
        autoFocus
        onFocus={selectAll}
        onKeyDown={cancelOnEscape}
        readOnly={saving}
        aria-busy={saving}
        aria-label={editLabel}
        aria-describedby={hintId}
        autoComplete="off"
      />
      <span id={hintId} className={styles.hint}>
        {saving ? "Saving…" : "Enter saves, Esc cancels"}
      </span>
      {error}
    </form>
  )
}
