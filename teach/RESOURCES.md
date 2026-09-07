# Effect atoms & resource lifetime — Resources

## Knowledge

- [Source: `AtomRegistry.js` in the installed `effect@4.0.0-rc.112`](../node_modules/effect/dist/unstable/reactivity/AtomRegistry.js)
  Primary source for the deferred removal: `subscribe` -> `scheduleNodeRemoval` -> `scheduleTask(..., 0)` -> `canBeRemoved` check -> `removeNode` (idle TTL or immediate). Use for: any question about when an atom is torn down.
- [Source: `Atom.js` (`makeEffect`, `makeResultFn`)](../node_modules/effect/dist/unstable/reactivity/Atom.js)
  Shows that `runtime.atom` creates a `Scope`, registers `Scope.close` as an atom finalizer and interrupts the fiber on re-run. Use for: what "release" means for an effect atom.
- [README: `@effect-atom/atom`](https://github.com/tim-smart/effect-atom/blob/main/README.md)
  States the default: an atom is reset when no longer used, `Atom.keepAlive` opts out. Use for: `keepAlive`, `setIdleTTL`, reactivity keys.
- [React docs: `<StrictMode>`](https://react.dev/reference/react/StrictMode)
  Documents the extra setup+cleanup cycle in development and why it exists (missing cleanup bugs). Use for: why one `subscribed` appears in dev.
- [React docs: Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
  The mount/unmount/mount model and the "do not suppress it with refs" advice. Use for: the mental model of effect cleanup.
- [Jotai docs: `atom` (`onMount`)](https://jotai.org/docs/core/atom)
  Says an atom "can be unmounted and then mounted immediately" under StrictMode: Jotai tears down synchronously. Use for: the contrast case.
- [TanStack Query docs: Caching](https://tanstack.com/query/latest/docs/framework/react/guides/caching)
  When the last observer unmounts a garbage-collection timeout (`gcTime`, 5 min default) is set; remount before it cancels it. Use for: deferred teardown measured in minutes.
- [RxJS `share` config (`resetOnRefCountZero`)](https://rxjs.dev/api/index/function/share)
  Accepts a notifier factory for "conditional or delayed resets" when subscribers drop to zero. Use for: deferred teardown in streams.
- [Package README: `rxjs-ShareReplayWithDeferredUnsubscribe`](https://github.com/maxbendick/rxjs-ShareReplayWithDeferredUnsubscribe)
  The pattern in its purest form: when all observers leave, unsubscription from the source is deferred until a trigger emits. Use for: the plain-RxJS version of "wait, then check".
- [RxJS PR #6169: use another observable to control resets](https://github.com/ReactiveX/rxjs/pull/6169)
  Where `resetOnRefCountZero: () => timer(ms)` was designed; discussion explains why a delayed reset was needed. Use for: motivation from the library authors.
- [Article: RxJS Multicast Operator — DEV Community (this-is-learning)](https://dev.to/this-is-learning/rxjs-multicast-operator-1k9i)
  Walkthrough of `share` config including the timer-based reset. Use for: a readable intro before the API page.
- [Relay issue #3298: `useLazyLoadQuery` breaks with GC after quick unmount -> mount](https://github.com/facebook/relay/issues/3298)
  A real bug caused by immediate garbage collection on unmount; led to the release buffer. Use for: "what goes wrong without the delay" (title verified, body not fetched).
- [Relay docs: Presence of Data (`gcReleaseBufferSize`, `gcScheduler`)](https://relay.dev/docs/guided-tour/reusing-cached-data/presence-of-data/)
  Released queries stay in a buffer of 10 before GC; GC scheduling is pluggable. Use for: deferred teardown by count instead of by time.
- [Jotai issue #2179: `onMount` cleanup called right after mount in React dev mode](https://github.com/pmndrs/jotai/issues/2179)
  The immediate-teardown pain under StrictMode, from users. Use for: contrast case (title verified, body not fetched).
- [Article: Understanding staleTime vs gcTime in TanStack Query — Medium](https://medium.com/@bloodturtle/understanding-staletime-vs-gctime-in-tanstack-query-e9928d3e41d4)
  Plain explanation of the 5-minute GC timer after the last observer unmounts. Use for: a second voice on `gcTime`.
- [Article: useEffect Fired Twice and It Found a Real Bug — DEV Community](https://dev.to/rbonweb/useeffect-fired-twice-and-it-found-a-real-bug-5438)
  A leaked subscription found by StrictMode's double cycle. Use for: why not to disable StrictMode.

## Wisdom (Communities)

- [Effect Discord](https://discord.gg/effect-ts)
  Official community; `#atom` / `#help` channels, library authors answer. Use for: design questions about atoms and layers.
- [effect-atom GitHub issues](https://github.com/tim-smart/effect-atom/issues)
  Use for: confirming whether a behaviour is intended before relying on it.

## Gaps
- There is no single canonical name for the pattern; libraries call it deferred unsubscribe, delayed reset, gcTime, release buffer. Search by those words.
- No prose documentation for `AtomRegistry` internals in rc.112; the source is the only reference.
- Zustand docs were not fetched (404); its `subscribe` is a plain listener list with immediate unsubscribe, unverified here.
