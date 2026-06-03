---
name: parallel-tasks
description: >-
  Fan out several task-implementer agents in parallel — one isolated git
  worktree each — over an independent wave of backlog tasks for team
  michele-luca's Exercise One, then integrate their branches serially with
  --no-ff. Use when asked to "run N tasks in parallel", "work the next wave",
  or to launch multiple dev agents at once and merge the results.
---

# parallel-tasks — fan out + serial integrate

You are the **launcher**. You pick an independent set of backlog tasks, spawn
one `task-implementer` agent per task (each in its own git worktree, so they
don't clobber each other), wait for them all, then merge the finished branches
back **one at a time** with `--no-ff`. The agents do the coding and review; you
own task selection and integration.

Everything runs against the exercise folder
`teams/michele-luca/excercise_one/`. Read its `CLAUDE.md` and the
`task-implementer` agent doc — this skill assumes that agent's lifecycle
(claim → Working → Review via `qa-reviewer` → Done → commit on own branch).

## Usage

```
/parallel-tasks                       # auto-pick the next independent wave from INDEX.md
/parallel-tasks TASK-005 TASK-007     # run exactly these (must be mutually independent)
/parallel-tasks --max 3               # cap how many run at once
```

## Step 1 — Choose the wave (mutually independent tasks)

A "wave" is a set of tasks that can run **at the same time without depending on
each other**. Getting this right is the whole game — parallelising dependent
tasks just produces merge pain.

1. If task IDs were passed as args, use those. Otherwise read
   `docs/backlog/INDEX.md` (it literally lists "Parallel Work Opportunities" by
   wave) and `docs/backlog/TASK-*.md`.
2. Keep only tasks that are:
   - status `Ready`/`pending`,
   - **not** claimed already (no `refs/claims/<TASK-ID>` — check with
     `git show-ref --verify --quiet refs/claims/<TASK-ID>`),
   - whose dependencies are already merged into the current team branch, and
   - **independent of each other** (none lists another in the set as a blocker).
3. Apply `--max` if given. Confirm the chosen set with the user before spawning
   if it's more than ~4 agents (each is a worktree + `npm install` + a build).

## Step 2 — Preflight the base

- Be on the team branch `team-michele-luca` with a clean working tree
  (`git status` clean). Parallel worktrees branch off whatever HEAD is now, so a
  dirty or wrong base contaminates every agent.
- Don't pre-create worktrees yourself — the Agent tool's `isolation: "worktree"`
  does that per agent.

## Step 3 — Fan out (all in ONE message)

Spawn **one `task-implementer` per chosen task, in a single message** so they
run concurrently. For each, set `isolation: "worktree"` and name the task so the
agent claims exactly that one:

```
Agent(
  subagent_type: "task-implementer",
  isolation: "worktree",
  description: "Implement <TASK-ID>",
  prompt: "You are running in parallel with other agents. Claim and implement \
           <TASK-ID> end-to-end per your lifecycle: atomic claim via \
           refs/claims/<TASK-ID>, npm install if node_modules is missing, \
           implement with dev-skill on an auto-picked free port, spawn qa-reviewer \
           (NO worktree isolation) for review, drive Review→Working until clean, \
           set Done, then commit on your worktree branch and report back: \
           TASK-ID, branch name, claim ref, final status, one-line summary."
)
```

The atomic claim (`git update-ref refs/claims/<TASK-ID> HEAD 000…0`) means even
if a task slips into two agents, only one proceeds — so over-spawning is safe,
not corrupting.

## Step 4 — Collect results

Each agent returns: TASK-ID, branch name, claim ref, final status, summary.
Sort them into:

- **Done** — committed on a worktree branch, ready to integrate.
- **Stuck** (left in `Working`, e.g. review didn't converge in 3 rounds, or an
  error). Don't merge these; surface them to the user with the agent's reason.

## Step 5 — Integrate serially (the part that must NOT be parallel)

Merge finished branches **one at a time** — concurrent merges into the same
team branch race and conflict. Go in dependency order (a task's prerequisites
merge first):

For each Done branch:

1. `git merge --no-ff <branch>` into `team-michele-luca` (the workshop policy —
   never fast-forward; each unit stays visible in history).
2. **Resolve conflicts.** Parallel feature branches almost always collide on the
   shared seams (`src/App.tsx`, `src/main.tsx`, barrel files) — usually
   *additive* (both branches register a new component/route). Combine both
   sides; don't drop either feature.
3. **Re-run the QA gate on the integrated result** —
   `node teams/michele-luca/excercise_one/.claude/skills/qa-skill/qa.mjs`. Two
   branches can each pass alone yet break once merged (duplicate symbols, type
   clashes). A green per-branch QA is not a green integration.
4. Retire the claim: `git update-ref -d refs/claims/<TASK-ID>`.
5. Remove the merged worktree if it lingers: `git worktree remove <path>`
   (Agent isolation auto-cleans unchanged worktrees, but a committed one stays).

If a merge conflict is non-trivial or QA fails after merge and you can't fix it
quickly, stop, leave the team branch in a known-good state (abort that one merge
with `git merge --abort`), and report which task needs hands-on integration.

## Step 6 — Report

Summarise: which tasks merged (with their commits), which are stuck and why,
any claims still held, and the final `qa-skill` verdict on the team branch.
Do **not** push unless the user asks.

## Gotchas

- **Independence is on you.** The claim ref stops double-*work*; it does nothing
  about *logical* dependencies. Picking a blocked task into a wave just means its
  agent stalls or builds on missing code. Trust INDEX.md's waves.
- **`npm install` per worktree** costs a minute or two each (no browser download
  — system Edge). Don't fan out 10 agents on a whim; waves of 2–4 are the sweet
  spot.
- **Nested subagents.** Each `task-implementer` spawns a `qa-reviewer`. If the
  runtime forbids second-level subagents, the review step fails — fall back to
  having `task-implementer` run `qa-skill` inline (see that agent's doc).
- **Stuck claims block re-runs.** A crashed agent leaves `refs/claims/<TASK-ID>`
  behind. List leftovers with `git for-each-ref refs/claims/` and clear stale
  ones with `git update-ref -d` before re-launching.
