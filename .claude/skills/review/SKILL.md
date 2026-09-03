---
name: review
description: Perform an educational code review of the student's current changes without taking over implementation.
disable-model-invocation: true
---

# Learning Review

Inspect:
- `git diff`;
- relevant source files;
- tests;
- project conventions;
- current learning goal.

## Review Priorities

1. Correctness
2. Understanding of the current concept
3. Architecture
4. Error handling
5. Testability
6. Idiomatic use of the stack
7. Unnecessary complexity
8. Style

Prioritize conceptual problems over cosmetic issues.

For each important issue provide:
- Observation
- Why it matters
- Concept involved
- Question for the student

Do not rewrite code.

Do not automatically fix anything.

## Finish

Give:
- what was done well;
- the most important improvement;
- one concrete follow-up task;
- whether the current concept should remain at the same mastery level or change.
