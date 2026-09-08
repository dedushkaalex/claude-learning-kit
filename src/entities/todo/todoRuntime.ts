import { ConfigProvider, Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"
import { KeyValueStore } from "effect/unstable/persistence"
import { Atom } from "effect/unstable/reactivity"
import { TodoClient } from "./todoClient"

const browserConfig = ConfigProvider.layer(
  ConfigProvider.fromEnvRecord({ TODO_API_URL: import.meta.env.VITE_TODO_API_URL }),
)

const todoClientLayer = TodoClient.layer.pipe(
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(browserConfig),
)

export const runtime = Atom.runtime(
  Layer.merge(
    todoClientLayer,
    KeyValueStore.layerStorage(() => localStorage),
  ),
)
