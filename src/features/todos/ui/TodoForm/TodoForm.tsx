import { AsyncResult } from "effect/unstable/reactivity"
import { ErrorMessage } from "../../../../shared/ui/ErrorMessage/ErrorMessage"
import { useTodoForm } from "../../hooks/useTodoForm"
import styles from "./TodoForm.module.css"

export function TodoForm() {
  const { result, submit } = useTodoForm()

  return (
    <>
      <form className={styles.form} onSubmit={submit}>
        <input
          name="title"
          className={styles.input}
          placeholder="What needs doing?"
          autoComplete="off"
        />
        <button type="submit" className={styles.submit} disabled={result.waiting}>
          Add
        </button>
      </form>
      {AsyncResult.builder(result)
        .onErrorTag("EmptyTitle", () => <ErrorMessage>Title cannot be empty</ErrorMessage>)
        .onErrorTag("TitleTooLong", (error) => (
          <ErrorMessage>Title must be at most {error.max} characters</ErrorMessage>
        ))
        .orNull()}
    </>
  )
}
