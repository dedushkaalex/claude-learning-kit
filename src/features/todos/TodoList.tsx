import { useAtomSet, useAtomValue } from "@effect/atom-react"
import { Cause } from "effect"
import { AsyncResult } from "effect/unstable/reactivity"
import { removeTodoAtom, todosAtom, toggleTodoAtom } from "../../entities/todo/todoStore"
import { TodoCard } from "../../entities/todo/ui/TodoCard/TodoCard"
import { ErrorMessage } from "../../shared/ui/ErrorMessage/ErrorMessage"
import { StatusMessage } from "../../shared/ui/StatusMessage/StatusMessage"
import styles from "./TodoList.module.css"

export function TodoList() {
  const todos = useAtomValue(todosAtom)
  const toggle = useAtomSet(toggleTodoAtom)
  const remove = useAtomSet(removeTodoAtom)

  return AsyncResult.builder(todos)
    .onInitial(() => <StatusMessage>Loading todos…</StatusMessage>)
    .onSuccess((res) =>
      res.length === 0 ? (
        <StatusMessage>Nothing to do yet</StatusMessage>
      ) : (
        <ul className={styles.list}>
          {res.map((todo) => (
            <TodoCard key={todo.id} todo={todo} onToggle={toggle} onRemove={remove} />
          ))}
        </ul>
      ),
    )
    .onFailure((cause) => (Cause.hasDies(cause) ? <ErrorMessage>Error</ErrorMessage> : "dsf"))
    .orNull()
}
