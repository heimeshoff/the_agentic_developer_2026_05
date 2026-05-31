---
name: task-orchestrator
description: This skill should be used when the user asks to "orchestrate tasks", "break down a feature", "plan the work", "create tasks for the developer agent", "assign tasks", "decompose the requirement", or "set up the task queue". Takes a high-level requirement, explores the codebase, breaks the work into discrete coding tasks, writes task files to .claude/tasks/, and hands them off to the dev-coder skill one at a time.
version: 1.0.0
---

# Task Orchestrator Skill

Decomposes a high-level feature or requirement into discrete coding tasks, writes them as structured JSON files to `.claude/tasks/`, and hands each task to the `dev-coder` skill for implementation.

## Input

The feature or requirement to implement is in `$ARGUMENTS`. If empty, ask the user to describe what needs to be built before proceeding.

## Execution Steps

### Step 1 — Understand the requirement
1. Read `$ARGUMENTS` carefully.
2. If anything is ambiguous (language, output location, scope), ask the user now — before exploring the codebase.
3. Confirm: restate the goal in one sentence and ask the user to approve before continuing.

### Step 2 — Explore the codebase
1. Launch 1–2 Explore agents in parallel to understand relevant existing code:
   - Agent A: Find the team's exercise folder and read any existing source files.
   - Agent B: Check `.claude/tasks/` for existing task files to avoid ID collisions.
2. Read all key files the agents surface before designing tasks.

### Step 3 — Design the task list
Break the requirement into the smallest independently-implementable coding units. For each task:
- One task = one output file (one class, one module, one script).
- Tasks that depend on another task's output must declare that dependency.
- Order tasks so dependencies come first (topological order).

Present the proposed task list to the user as a numbered table:

| # | Title | Language | Output path | Depends on |
|---|-------|----------|-------------|------------|
| 1 | … | … | … | — |
| 2 | … | … | … | task-001 |

Ask the user to approve, adjust, or cancel before writing any files.

### Step 4 — Write task files
For each approved task, write a file to `.claude/tasks/<task-id>.json` using this schema:

```json
{
  "task_id": "task-NNN",
  "title": "Short title",
  "description": "What to build and why",
  "language": "<target language>",
  "output_path": "teams/<team>/exercise_<n>/path/to/File.ext",
  "requirements": [
    "Specific, testable requirement 1",
    "Specific, testable requirement 2"
  ],
  "context": "Relevant background for the dev-coder agent",
  "assigned_by": "task-orchestrator",
  "dependencies": ["task-NNN"]
}
```

Also overwrite `.claude/tasks/current-task.json` with the contents of the **first** task (lowest task_id with no unmet dependencies).

### Step 5 — Invoke dev-coder for each task in order
For each task in dependency order:
1. Copy (overwrite) `.claude/tasks/current-task.json` with the task's JSON.
2. Invoke the `dev-coder` skill (via the Skill tool) and wait for it to complete.
3. Verify the output file exists at the declared `output_path`.
4. If dev-coder reports an error or the file is missing, stop and report the problem to the user.
5. Move to the next task only after the current one succeeds.

### Step 6 — Final summary
After all tasks complete, present:
- A table of every task: ID, title, output path, status (done / failed)
- Any assumptions made during decomposition
- Suggested next steps (e.g. "run tests", "add a task for the UI layer")

## Task ID Convention

Use zero-padded three-digit integers: `task-001`, `task-002`, …

To avoid collisions with existing task files, scan `.claude/tasks/` for the highest existing ID and increment from there.

## Rules

- Never start implementing until the user approves the task list (Step 3).
- Never modify existing source files — only write to new `output_path` locations (unless the task explicitly says "modify").
- Keep each task self-contained: the `requirements` array must be specific enough that dev-coder can implement without asking further questions.
- If a requirement spans more than one output file, split it into multiple tasks.
