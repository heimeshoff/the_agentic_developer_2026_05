---
description: Implementation coordinator — picks ready, non-conflicting tasks from tasks/todo, dispatches parallel worker subagents, and auto-commits one commit per passing task.
argument-hint: "[--max N] [task-id]"
---

# /work

You are the **coordinator** on the implementation terminal. The `/brainstorm` terminal
feeds `tasks/todo/`; you turn ready tasks into committed code.

**You never write product code yourself.** You scan, build the dependency graph, dispatch
worker subagents, run checks, and commit. All coding is delegated. Keeping yourself lean
is what lets this run across many tasks without choking on context.

Arguments (may be empty): **$ARGUMENTS**
- `--max N` overrides the parallel cap (default **2**).
- A bare `task-id` (e.g. `t-007`) means: work only that task, ignore the loop.

## Step 1 — Recovery check

Look at `tasks/doing/`:
- **empty** → go to Step 2.
- **1 task** → a previous run was interrupted. Finish that one first, sequentially, before any new dispatch.
- **2+ tasks** → a previous parallel run was interrupted. Ask the user: resume all / resume one at a time / move them back to `todo/`. Don't guess.

## Step 2 — Build the dependency graph

1. Read `CLAUDE.md` and `VISION.md` for orientation (skim — don't memorize).
2. List `tasks/todo/`, `tasks/doing/`, and `tasks/done/`. Read the frontmatter of every `todo/` task: `id`, `depends_on`, `files`, `type`, `title`.
3. A todo task is **ready** when every id in `depends_on` is present in `tasks/done/`. A missing dependency id is treated as unmet — warn the user, don't silently run it.
4. **Detect cycles.** If the ready-set computation reveals a dependency cycle, stop and show it. Do not pick one arbitrarily.
5. Tell the user in one line: "N ready, M blocked (waiting on …)."

If `todo/` is empty and `doing/` is clear → report and stop (the brainstorm terminal may add more later; re-run `/work` then).

## Step 3 — Pick this wave (conflict-aware)

1. Start from the ready set, lowest `id` first.
2. Walk down adding tasks to the wave, but **skip a task if its `files` overlap any task already in the wave** (same path or overlapping glob). The skipped task waits for a later wave.
3. Cap the wave at **MAX_PARALLEL** (default 2, or `--max N`).
4. If a bare `task-id` was passed, the wave is just that one task (still verify its deps are met).

## Step 4 — Dispatch

1. **Move each selected task file from `todo/` to `doing/`** and set its `status: doing`. Do this *before* spawning, so workers can't race for the same file.
2. **Spawn one `worker` subagent per task, all in a single message** (parallel tool calls), using the Agent tool with `subagent_type: "worker"`. Give each worker the prompt below.
3. **Wait for all workers in the wave to return**, then process each per Step 5.

### Worker prompt (fill the placeholders)

```
You are a worker implementing ONE task. Stay strictly inside its scope.

Task file (now in tasks/doing/): <ABSOLUTE PATH>
Project root: <ABSOLUTE PATH to exercise_one>

Read first: the task file, then CLAUDE.md (money rules, tech stack, conventions),
then VISION.md only if you need domain context.

Follow CLAUDE.md exactly: TypeScript strict; money as integer minor units + currency
(never floats); validate at boundaries with Zod and infer types from the schema;
parameterized SQL only; keep domain logic in api services. Prefer the Serena tools
for reading and editing code, per the project's tool rules.

Do the work end to end, then VERIFY before claiming done. "Done" means demonstrated
working. Climb as high up these levels as the task warrants, each must pass:
  L0 typecheck + lint clean.
  L1 tests green (write tests for money/budget math; confirm they actually ran).
  L2 if it boots (API/server/CLI/migration): start it on a unique free port
     (PORT=$((4100 + RANDOM % 800))), confirm logs show no errors, curl the endpoint,
     then kill it. Always tear down.
  L3 if it has UI: with the app running, drive the affected screen with Playwright
     headless, assert it renders with no browser-console errors, save a screenshot to
     tasks/done/evidence/<id>.png, then tear down.
A money util stops at L1; an API endpoint at L2; a UI form at L3. If a required level
can't run because the project isn't scaffolded for it, BOUNCE — don't claim done.

When acceptance criteria are met AND the gate passes: move the task file from
tasks/doing/ to tasks/done/, set status: done and completed: <today>. Then return the
strict block below.

RULES:
- Do NOT run any git command. The coordinator owns git.
- Do NOT touch any task file other than your own.
- If the task is under-refined (no concrete acceptance criteria, unclear scope, unmet
  deps you can't satisfy), move it to tasks/backlog/ with a "## Worker note" explaining
  what's missing, and return RESULT: BOUNCED instead of guessing.

Return ONLY this block, nothing else:

RESULT: SUCCESS
TASK_ID: <id>
SUMMARY: <one domain-language sentence>
TYPE: <feature|bug|refactor|chore|spike|scaffold>
FILE_LIST: <comma-separated absolute paths you created or modified, EXCLUDING the task file>
TESTS_ADDED: <integer>
VERIFIED: <highest level reached + what passed, e.g. "L3 — typecheck+test+app-boot+browser, no console errors">
EVIDENCE: <paths to screenshot/log proof, e.g. tasks/done/evidence/t-005.png; or "n/a">

(or)

RESULT: BOUNCED
TASK_ID: <id>
REASON: <one or two sentences>

(or)

RESULT: FAILED
TASK_ID: <id>
ERROR: <where and why, one or two sentences>
```

## Step 5 — Process each return, then commit

Handle workers in the order they return.

**RESULT: SUCCESS → verify, then commit (one commit per task):**
1. **Cross-check the worker's verification against the task type.** A UI task must report `VERIFIED: L3` with an `EVIDENCE` screenshot that actually exists on disk; a service/API/migration task must report at least `L2`. If the worker claimed done below the level the task demands, or the `EVIDENCE` file is missing, treat it as FAILED — do not commit.
2. **Backstop the checks yourself** (the worker can be wrong about its own work): sanity-check the diff (`git --no-pager diff --stat`, then the actual changes for `FILE_LIST`) — empty or obviously wrong → FAILED. Re-run `pnpm typecheck` and `pnpm test` regardless of what the worker reported. If anything fails, do not commit — move the task back to `doing/`, append a note, re-dispatch once, then escalate to the user.
3. **Commit, staging by name only — never `git add -A`:**
   ```bash
   git add <each path in FILE_LIST> tasks/done/<id>-<slug>.md <EVIDENCE screenshot path, if any>
   git commit -m "$(cat <<'EOF'
   <type>: <summary> [<id>]

   Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
   EOF
   )"
   ```
   `<type>` is the worker's `TYPE`. Confirm you are on the `Davide_and_Vojtech` branch first (never commit team work to `main`).
4. Note the short SHA for the end-of-run report. The canonical task↔commit link is the `[<id>]` tag, findable via `git log --grep "\[<id>\]"`.

**RESULT: BOUNCED:** the worker already moved the file to `backlog/`. Don't commit. Note it for the report.

**RESULT: FAILED:** leave the task in `doing/` (so it doesn't silently retry). Note the error for the report. One failure doesn't abort the wave — the other workers are processed normally.

## Step 6 — Loop

After the wave is fully processed, **go back to Step 2 and re-scan.** New tasks may have
appeared in `todo/` (the brainstorm terminal adds them live) and finished tasks may have
unblocked others. Keep looping until `todo/` is empty and `doing/` is clear, or the user
stops you.

## Step 7 — Report

When the loop ends, summarize in plain prose:
- Tasks completed (with commit SHAs) and tasks still blocked (on what).
- Tasks bounced (and why) — these go back to the brainstorm terminal to refine.
- Tasks failed or escalated after retry — these need the user's attention now.
- Anything surprising: cycles, missing dependency ids, conflicts that forced serialization.
