import { HttpApiBuilder } from "effect/unstable/httpapi"
import { todoApi } from "@/entities/todo/todoApi"
import { todoHandlersLayer } from "@/entities/todo/todoHandlers"
import { Layer } from "effect"
import { HttpRouter } from "effect/unstable/http"
import { TodoRepository } from "@/entities/todo/todoRepository"
import { TodoIdGenerator } from "@/entities/todo/todoIdGenerator"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { createServer } from "node:http"
import { port } from "./port"

const services = Layer.mergeAll(TodoRepository.layerMemory, TodoIdGenerator.layer)

const api = HttpApiBuilder.layer(todoApi).pipe(Layer.provide(todoHandlersLayer))
const app = HttpRouter.serve(api).pipe(
  Layer.provide(services),
  Layer.provide(NodeHttpServer.layer(createServer, { port })),
)

NodeRuntime.runMain(Layer.launch(app))
