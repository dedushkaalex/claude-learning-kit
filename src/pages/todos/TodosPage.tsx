import { TodoCount } from "../../features/todos/ui/TodoCount/TodoCount"
import { TodoFilter } from "../../features/todos/ui/TodoFilter/TodoFilter"
import { TodoForm } from "../../features/todos/ui/TodoForm/TodoForm"
import { TodoList } from "../../features/todos/ui/TodoList/TodoList"
import styles from "./TodosPage.module.css"

export function TodosPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Todos</h1>
      <TodoForm />
      <TodoList />
      <footer className={styles.footer}>
        <TodoCount />
        <TodoFilter />
      </footer>
    </main>
  )
}
