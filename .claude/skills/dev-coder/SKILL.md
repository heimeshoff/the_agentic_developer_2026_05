---
name: dev-coder
description: This skill should be used when the user or an agent asks to "implement a task", "execute a dev task", "code the task", "write the code for a task", "pick up a task from the orchestrator", or when a task file needs to be implemented. Reads a structured task specification file written by an orchestrator agent and produces working code in the target programming language.
version: 1.0.0
---

# Dev Coder Skill

Implements coding tasks assigned by an orchestrator agent. Reads a structured task file, produces working code in the specified language, and writes output to the target path.

## Supported Languages

Java, Python, JavaScript, TypeScript, C#, Go, Rust, Kotlin, Ruby, Bash/Shell

## Task File Location

Look for the task file in this priority order:
1. Path given in `$ARGUMENTS` (if provided)
2. `.claude/tasks/current-task.json`
3. `.claude/tasks/current-task.md`

## Task File Format (JSON)

```json
{
  "task_id": "task-001",
  "title": "Short task title",
  "description": "What to build and why",
  "language": "python",
  "output_path": "teams/team-name/exercise_1/filename.py",
  "requirements": [
    "Specific behaviour or constraint 1",
    "Specific behaviour or constraint 2"
  ],
  "context": "Optional background — neighbouring code, data model, etc.",
  "assigned_by": "orchestrator-agent",
  "dependencies": []
}
```

## Task File Format (Markdown)

```markdown
# Task: <title>

**ID:** task-001
**Language:** python
**Output:** teams/team-name/exercise_1/filename.py
**Assigned by:** orchestrator-agent

## Description
What to build and why.

## Requirements
- Requirement one
- Requirement two

## Context
Optional background information.
```

## Execution Steps

### Step 1 — Read the task
1. Locate and read the task file (see priority order above).
2. If no task file is found, report the missing file path and stop.
3. Confirm understanding: restate the title, language, output path, and requirements in one short paragraph.

### Step 2 — Explore context
1. If `output_path` already exists, read it to understand existing patterns.
2. If `context` references other files, read those too.
3. If the task has `dependencies` listing other output files, read each one.

### Step 3 — Implement
1. Write clean, working code that satisfies every listed requirement.
2. Match the conventions of any existing code found in Step 2.
3. Do NOT add features beyond what the requirements specify.
4. Do NOT add comments unless the logic is genuinely non-obvious.

Language-specific defaults:
- **Java** — JDK 17+, standard Maven layout, JUnit 5 for tests
- **Python** — 3.10+, type hints, no third-party deps unless stated
- **TypeScript** — strict mode, ESM imports
- **JavaScript** — ESM, no transpiler unless stated
- **C#** — .NET 8, nullable enabled
- **Go** — modules, idiomatic error returns
- **Rust** — 2021 edition, Result/Option idioms
- **Kotlin** — JVM target, coroutines if async needed
- **Ruby** — 3.x, frozen string literal
- **Bash** — `set -euo pipefail`, POSIX-compatible unless stated

### Step 4 — Write output
1. Write the code to `output_path` specified in the task file.
2. If the output path does not exist yet, create any needed parent directories first.

### Step 5 — Report completion
Write a brief completion summary containing:
- `task_id` and `title`
- `output_path` of the file written
- A bullet list of each requirement and whether it was satisfied
- Any assumptions made that were not explicit in the task

## Error Handling

| Problem | Action |
|---|---|
| Task file not found | Report the expected path; do not guess or create a placeholder task |
| Language not supported | Report clearly; ask the user to add it to the skill |
| `output_path` directory missing | Create it, then write the file |
| Conflicting requirements | List the conflict and ask for clarification before writing code |
| Ambiguous requirement | State your interpretation, implement it, and flag it in the completion report |

## Notes

- Never modify the task file itself — it is owned by the orchestrator agent.
- Never invent requirements not present in the task file.
- If the task file contains a `dependencies` list, all dependency files should exist before implementation. If they do not, report the missing dependency and stop.
