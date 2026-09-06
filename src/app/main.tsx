import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { TodosPage } from "@/pages/todos/TodosPage"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TodosPage />
  </StrictMode>,
)
