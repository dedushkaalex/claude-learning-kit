import { HttpApiBuilder } from "effect/unstable/httpapi"
import { todoApi } from "@/entities/todo/todoApi"
import { Effect } from "effect"
import { TodoRepository } from "./todoRepository"
import { createTodo, removeTodo, renameTodo, toggleTodo } from "./todoService"

export const todoHandlersLayer = HttpApiBuilder.group(todoApi, "todo", (handlers) =>
  handlers
    .handle("todos", () => Effect.flatMap(TodoRepository, (r) => r.all))
    .handle("create", ({ payload }) => createTodo(payload.title))
    .handle("rename", ({ params: { id }, payload: { title } }) => renameTodo(id, title))
    .handle("toggle", ({ params: { id }, payload: { completed } }) => toggleTodo(id, completed))
    .handle("remove", ({ params: { id } }) => removeTodo(id)),
)
