# Alex can observe acquire/release timing but the deferred-removal model is not yet internalised

Alex built a hide/show toggle in the app, saw `subscribed -> unsubscribed -> subscribed`, explained the leak without `removeEventListener` (handlers accumulate, each invalidates), and noticed that fast toggles and StrictMode skip the cycle. When told the registry defers removal by one task and re-checks subscribers, they said "the mechanism is understood in general but not really". Lesson 0001 targets exactly this gap with a plain-JS counter and a simulator.

**Evidence:** session 2026-09-07, Phase 7 step 5; `learning/session.md` in the repo.

**Corrected misconception:** "release does not fire because nothing can unmount" — the release body was commented out; release did fire silently.

**Implications:** next lessons can assume mount/unmount vocabulary and `acquireRelease`; do not re-teach the leak. Verify the deferred-removal model with the quiz before moving to Phase 8 resources (HTTP client scope).
