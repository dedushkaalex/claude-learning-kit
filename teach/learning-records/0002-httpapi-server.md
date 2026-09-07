# Alex can assemble an HttpApi server but the contract details needed four correction rounds

Alex wrote the five handlers and `src/server/main.ts` correctly on the first attempt once the shape was given, and diagnosed the whole-list `save` problem unaided ("save does not know what changed, we need a method per operation"). The contract itself (`todoApi.ts`) went through four rounds: paths (`/todo:id`, singular vs plural), wrong methods, statuses (404 on validation, 400 on not-found, status on union members), `Void`/`Created` successes, no `HttpApi` assembly, `Title` in the payload. Lesson 0002 targets exactly these: request pipeline, where the status annotation lives, why payload validation belongs to the domain, why handlers go before `serve` and services after.

**Evidence:** session 2026-09-08, Phase 8 steps 1–3; `learning/session.md`.

**Corrected misconception:** "REST wants singular for one resource" — the path names the collection, the method names the action; consistency matters more than number.

**Implications:** next lessons can assume the four-layer server shape and `HttpApiTest`; the client side (`HttpApiClient`, transport errors, base URL) is the next zone. Verify the `serve`/order model with the quiz before Phase 8 step 5.
