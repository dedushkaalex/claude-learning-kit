import { expect, it } from "vitest"
import { OpenApi } from "effect/unstable/httpapi"
import { todoApi } from "../todoApi"

type Spec = {
  paths: Record<string, Record<string, { responses: Record<string, unknown> }>>
}

const spec = OpenApi.fromApi(todoApi) as unknown as Spec
const statuses = (path: string, method: string) =>
  Object.keys(spec.paths[path]![method]!.responses).sort()

it("контракт описывает пять маршрутов под одной коллекцией", () => {
  expect(Object.keys(spec.paths).sort()).toEqual(["/todos", "/todos/{id}", "/todos/{id}/toggle"])
  expect(Object.keys(spec.paths["/todos"]!).sort()).toEqual(["get", "post"])
  expect(Object.keys(spec.paths["/todos/{id}"]!).sort()).toEqual(["delete", "patch"])
})

it("валидация отвечает 400, отсутствие todo 404, удаление 204", () => {
  expect(statuses("/todos", "post")).toEqual(["200", "400"])
  expect(statuses("/todos/{id}", "patch")).toEqual(["200", "400", "404"])
  expect(statuses("/todos/{id}/toggle", "patch")).toEqual(["200", "404"])
  expect(statuses("/todos/{id}", "delete")).toEqual(["204", "404"])
})
