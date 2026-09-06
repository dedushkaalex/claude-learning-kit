import { useAtom } from "@effect/atom-react"
import type { FormEvent } from "react"
import { createTodoAtom } from "../../../entities/todo/todoStore"

export function useTodoForm() {
  const [result, create] = useAtom(createTodoAtom)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const title = String(new FormData(form).get("title") ?? "")
    create(title)
    form.reset()
  }

  return { result, submit }
}
