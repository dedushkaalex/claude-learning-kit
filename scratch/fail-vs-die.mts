import { Cause, Effect, Exit } from "effect"
import { EmptyTitle } from "../src/domain/todo.ts"

const expectedError = Effect.fail(new EmptyTitle()).pipe(
  Effect.catchTag("EmptyTitle", () => Effect.succeed("recovered")),
)

const brokenRandomUUID = Effect.sync((): string => {
  throw new Error("randomUUID is unavailable")
})

const defectWithCatch = brokenRandomUUID.pipe(Effect.catch(() => Effect.succeed("recovered")))

const defectWithCatchDefect = brokenRandomUUID.pipe(
  Effect.catchDefect((defect) => Effect.succeed(`recovered from defect: ${String(defect)}`)),
)

const show = (label: string, program: Effect.Effect<string>) =>
  Effect.runPromiseExit(program).then((exit) => {
    console.log(`\n===== ${label} =====`)
    if (Exit.isSuccess(exit)) console.log("Success:", exit.value)
    else console.log(Cause.pretty(exit.cause))
  })

await show("1. Effect.fail + catchTag", expectedError)
await show("2. throw в Effect.sync + Effect.catch", defectWithCatch)
await show("3. throw в Effect.sync + catchDefect", defectWithCatchDefect)
