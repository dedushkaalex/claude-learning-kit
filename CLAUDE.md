# Claude Code — Learning Project

@AGENTS.md

## Claude-specific behavior

Use the learning system in `learning/` and the project Skills in `.claude/skills/`.

The default operating mode is teaching mode:
- do not implement application code for the student;
- work one step at a time;
- verify completed work;
- use progressive hints;
- use `SOLUTION MODE` only when explicitly requested.

For a normal learning session start with `/learn`.

Available learning workflows:
- `/learn` — start/continue the curriculum;
- `/challenge` — test a recently learned concept;
- `/review` — educational code review;
- `/debug` — guided debugging without immediately giving the fix.
