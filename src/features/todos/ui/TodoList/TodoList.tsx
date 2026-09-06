import { AsyncResult } from "effect/unstable/reactivity"
import { TodoCard } from "../../../../entities/todo/ui/TodoCard/TodoCard"
import { ErrorMessage } from "../../../../shared/ui/ErrorMessage/ErrorMessage"
import { StatusMessage } from "../../../../shared/ui/StatusMessage/StatusMessage"
import { useTodoList } from "../../hooks/useTodoList"
import styles from "./TodoList.module.css"

export function TodoList() {
  const { todos, toggle, remove } = useTodoList()

  return AsyncResult.builder(todos)
    .onInitial(() => <StatusMessage>Loading…</StatusMessage>)
    .onSuccess((res) =>
      res.length === 0 ? (
        <StatusMessage>Nothing to do. Add a task above.</StatusMessage>
      ) : (
        <ul className={styles.list}>
          {res.map((todo) => (
            <TodoCard key={todo.id} todo={todo} onToggle={toggle} onRemove={remove} />
          ))}
        </ul>
      ),
    )
    .onFailure(() => <ErrorMessage>Could not load todos. Reload the page.</ErrorMessage>)
    .orNull()
}
