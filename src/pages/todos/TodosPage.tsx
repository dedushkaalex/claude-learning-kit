import { TodoForm } from "../../features/todos/TodoForm"
import { TodoList } from "../../features/todos/TodoList"
import styles from "./TodosPage.module.css"

export function TodosPage() {
  return (
    <div className={styles.page}>
      <h1>Todo list</h1>
      <TodoForm />
      <TodoList />
    </div>
  )
}
