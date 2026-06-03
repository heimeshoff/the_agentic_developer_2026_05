---
name: parallel-tasks
description: >-
  Autonomously work a wave of independent backlog tasks to completion for team
  michele-luca's Exercise One: fan out one task-implementer agent per task (each
  in its own git worktree), then integrate the finished branches serially with
  --no-ff and a green QA gate on the team branch. Runs to exactly one of two
  terminal states — every chosen task merged with the team branch green, or a
  clean STOP that leaves the team branch in a known-good state and asks the human
  for a specific intervention. Never leaves a half-merged or ambiguous result.
  Use when asked to "run N tasks in parallel", "work the next wave", "fan out the
  dev agents", or "finish the backlog autonomously".
---

# parallel-tasks — fan out, integrate, bring it home (or stop cleanly)

You are the **launcher**. You pick an independent set of backlog tasks, spawn one
`task-implementer` agent per task (each in its own git worktree so they don't
clobber each other), wait for them all, then merge the finished branches back
**one at a time** with `--no-ff` and re-gate the team branch. The agents do the
coding and review; you own task selection, integration, and the run's outcome.

Everything runs against the exercise folder
`teams/michele-luca/excercise_one/`. Read its `CLAUDE.md` and the
`task-implementer` agent doc — this skill assumes that agent's lifecycle
(claim → Working → Review via `qa-reviewer` → Done → commit on its own branch).

## Outcome contract (this is the point — read first)

A run of this skill MUST end in exactly one of two terminal states, and you must
say which one you reached:

- **🟢 DONE** — every task you chose is merged into `team-michele-luca`, all claim
  refs retired, all worktrees removed, and `qa-skill` is **green on the team
  branch**. Report what merged.
- **🟠 STOPPED, NEED HUMAN** — you hit one of the escalation gates below. You have
  left the team branch in a **known-good, buildable state** (any in-flight merge
  aborted), preserved the evidence (branches, claim refs, logs), and produced the
  **escalation report** so a human can take over with zero re-derivation.

You never end in a third state. No half-merged tree, no "I think it's probably
fine", no silent truncation of the wave. If you cannot safely reach DONE, you
STOP — deliberately and legibly. Autonomy means finishing the work *or* handing
it back cleanly, never abandoning it mid-air.

## Context you gather yourself (don't ask the user for what you can read)

Be self-sufficient. Before doing anything, collect the context this run needs so
you can act without a human in the loop for the happy path:

- **Where you are:** confirm the exercise folder and that you're inside the git
  repo. `git rev-parse --show-toplevel`.
- **Branch + cleanliness:** current branch is `team-michele-luca` and the working
  tree is clean (`git status --porcelain` empty). This is the base every worktree
  branches from.
- **The backlog and its waves:** read `docs/backlog/INDEX.md` (it lists "Parallel
  Work Opportunities" by wave) and the candidate `docs/backlog/TASK-*.md`. Learn
  both file formats (`## Metadata` style for TASK-001…017, YAML frontmatter for
  newer ones) so you read `Status`, `dependencies`, `wave`, `touches`,
  `seam_edits` correctly.
- **Live claims:** `git for-each-ref refs/claims/` — what's already owned, and
  whether any are stale (see Step 0 recovery).
- **Toolchain:** Node 24 / npm 11 available. Worktrees install their own deps.

If something here is genuinely missing or contradictory (no INDEX, not a git
repo, unknown task format), that's a STOP-and-ask gate — don't guess.

## Step 0 — Preflight & recovery (make the base safe and atomic)

1. **Confirm base.** On `team-michele-luca`, working tree clean. If dirty: STOP
   and ask — a dirty base contaminates every worktree, and you must not stash or
   discard the user's uncommitted work on your own.
2. **Recover stale claims.** A crashed earlier run leaves `refs/claims/<TASK-ID>`
   behind, which would block re-launching that task forever. List them:
   `git for-each-ref --format='%(refname)' refs/claims/`. A claim is **stale** only
   if no live agent owns it and its task is not currently `Working` in a branch
   you can see. When you are confident it's abandoned, release it:
   `git update-ref -d refs/claims/<TASK-ID>`. **Never** clear a claim for a task
   another agent is actively working — when unsure, treat it as live and exclude
   that task from this wave instead of force-clearing.
3. **Note leftover worktrees/branches** from prior runs
   (`git worktree list`, `git branch --list`). Don't reuse them blindly; a
   committed-but-unmerged branch from a previous run is *integration work*, not
   trash — surface it in your plan rather than deleting it.

## Step 1 — Choose the wave (mutually independent tasks)

A "wave" is a set of tasks that can run **at the same time without depending on
each other**. Getting this right is the whole game — parallelising dependent or
file-overlapping tasks just produces merge pain.

1. If task IDs were passed as args, those are your candidates. Otherwise read the
   wave list in `INDEX.md` plus the `TASK-*.md` files.
2. Keep only tasks that are **all** of:
   - status `Ready`/`pending`,
   - **not** already claimed (`git show-ref --verify --quiet refs/claims/<TASK-ID>`
     exits non-zero),
   - whose `dependencies` are already merged into the current team branch, and
   - **file-disjoint from each other** — compare `touches`/`seam_edits`; two tasks
     that edit the same file or the same shared seam (`src/App.tsx`,
     `src/main.tsx`, `src/types/` barrel, `src/lib/storage.ts`) must **not** be in
     the same wave. If two candidates overlap, keep one and defer the other.
3. Apply `--max` if given. If the resulting set is more than ~4 agents (each is a
   worktree + `npm install` + a build), confirm the set with the user before
   spawning — that's a cost checkpoint, not an escalation.
4. **If the chosen set is empty**, say why precisely (everything claimed / blocked
   by unmerged deps / nothing Ready) and stop — that's a clean DONE-for-now, not a
   failure.

## Step 2 — Fan out (all in ONE message)

Spawn **one `task-implementer` per chosen task, in a single message** so they run
concurrently. For each, set `isolation: "worktree"` and name the task so the agent
claims exactly that one. Give each the context to run end-to-end with no
follow-up from you:

```
Agent(
  subagent_type: "task-implementer",
  isolation: "worktree",
  description: "Implement <TASK-ID>",
  prompt: "You run in parallel with other agents. Claim and implement <TASK-ID> \
           end-to-end per your lifecycle: atomic claim via refs/claims/<TASK-ID>, \
           npm install if node_modules is missing, implement with dev-skill on an \
           auto-picked free port, set Review and spawn qa-reviewer (NO worktree \
           isolation) for review, drive Review→Working until clean (max 3 rounds), \
           set Done, commit on your worktree branch, and report back EXACTLY: \
           TASK-ID, branch name, claim ref, final status (Done|Working/stuck), and \
           a one-line summary. If you cannot reach Done, leave the task in Working \
           and report why — do NOT merge or push."
)
```

The atomic claim (`git update-ref refs/claims/<TASK-ID> HEAD 000…0`) means even if
a task slips into two agents, only one proceeds — so over-spawning is safe, not
corrupting.

## Step 3 — Collect results

Each agent returns: TASK-ID, branch, claim ref, final status, summary. Sort them:

- **Done** — committed on a worktree branch, ready to integrate.
- **Stuck** — left in `Working` (review didn't converge in 3 rounds, a build that
  won't go green, or an error). Do **not** merge these.
- **No-show** — an agent that errored out or returned nothing usable.

A wave with *some* Done and *some* Stuck is normal: you still integrate the Done
ones (below), then escalate the rest. Partial success is progress, not failure —
bring home what's ready.

## Step 4 — Integrate serially (the part that must NOT be parallel)

Merge finished branches **one at a time** — concurrent merges into the same team
branch race and conflict. Go in **dependency order** (a task's prerequisites merge
first). Treat each merge as an **atomic unit**: it either lands green or is fully
rolled back, never left half-applied.

For each Done branch:

1. `git merge --no-ff <branch>` into `team-michele-luca` (workshop policy — never
   fast-forward; each unit stays visible in history).
2. **Resolve conflicts.** Parallel feature branches usually collide on the shared
   seams, and the collision is almost always *additive* (both register a new
   component/route). Combine both sides; never drop a feature. If a conflict is
   **non-trivial** — semantic, not a clean both-add — do NOT guess: `git merge
   --abort`, leave that branch unmerged, and route it to escalation.
3. **Re-run the QA gate on the integrated result:**
   `node .claude/skills/qa-skill/qa.mjs`. Two branches can each pass alone yet
   break once merged (duplicate symbols, type clashes). **Green per-branch QA is
   not a green integration.**
   - **QA green:** the merge stands. Retire the claim
     (`git update-ref -d refs/claims/<TASK-ID>`) and remove the worktree if it
     lingers (`git worktree remove <path>` — isolation auto-cleans unchanged ones,
     but a committed one stays).
   - **QA red and you can fix it quickly** (an obvious additive merge artifact):
     fix on the team branch, re-run QA, and only then retire the claim.
   - **QA red and not a quick fix:** `git merge --abort` (or reset the team branch
     to the pre-merge commit if the merge already committed), leaving the team
     branch exactly as it was before this branch. Route the task to escalation.

After each successful merge the team branch is green — so at every moment the base
is shippable, and a later failure only costs the one branch that failed, not the
whole wave.

## Step 5 — Bring it home, or stop cleanly

- **All chosen tasks merged + team branch green →** 🟢 **DONE.** Optionally, if the
  user asked you to "finish the backlog" (not just one wave) and a *next* wave is
  now unblocked (its deps just merged), you may loop back to Step 1 and run it.
  Bound this: stop after the backlog is empty, or after a wave makes **no forward
  progress** (every task stuck or unmergeable) — don't spin.
- **Anything stuck, unmergeable, or QA-red-unfixable →** 🟠 **STOP, NEED HUMAN.**
  First make the base safe (every in-flight merge aborted, team branch green and
  committed-clean), *then* produce the escalation report.

Do **not** push in either case unless the user asks.

## When to STOP and ask the human (escalation gates)

Stop the moment you hit any of these — do not churn or improvise around them:

1. **Dirty/unknown base** — team branch dirty, not on `team-michele-luca`, missing
   `INDEX.md`, or a task in an unrecognised format.
2. **Non-trivial merge conflict** — a semantic clash you can't resolve as a safe
   additive combine.
3. **Integration QA stays red** after a reasonable quick-fix attempt on the team
   branch.
4. **An agent left a task Stuck** (review didn't converge in 3 rounds, build won't
   go green, or it errored).
5. **Stale-claim ambiguity** — you can't tell whether a `refs/claims/<TASK-ID>` is
   abandoned or live. Never force-clear a possibly-live claim.
6. **No safe forward progress** — repeated waves produce only stuck/unmergeable
   tasks.

Before stopping, **always** leave the team branch known-good: abort any in-flight
merge (`git merge --abort`), confirm `git status` clean and `qa-skill` green on the
team branch, and keep the failing branches + claim refs intact as evidence.

### Escalation report (what to hand the human)

```
🟠 parallel-tasks STOPPED — human intervention needed

Team branch: team-michele-luca  (clean: yes/no, qa-skill: green/red)

Merged this run:
- TASK-00X (commit <sha>) — <one line>

Blocked / needs you:
- TASK-00Y — <gate hit: e.g. "merge conflict in src/App.tsx, semantic">
    branch: <branch>   claim: refs/claims/TASK-00Y (still held)
    what I tried: <...>   what I need: <the specific decision/fix>

Claims still held: refs/claims/TASK-00Y
Worktrees left: <path or none>

Suggested next step for you: <e.g. "resolve the App.tsx conflict by hand, then
re-run /parallel-tasks to integrate the rest">
```

Be specific in "what I need" — the whole value of stopping cleanly is that the
human acts in one step instead of re-investigating.

## Step 6 — Report

Whichever terminal state you reached, summarise: which tasks merged (with commits),
which are stuck and why, any claims still held, worktrees left, and the final
`qa-skill` verdict on the team branch. End with the explicit state: 🟢 DONE or
🟠 STOPPED.

## Gotchas

- **Independence is on you.** The claim ref stops double-*work*; it does nothing
  about *logical* or *file* dependencies. Picking a blocked or file-overlapping
  task into a wave just means its agent stalls or its branch conflicts. Trust
  INDEX.md's waves and the `touches`/`seam_edits` metadata.
- **`npm install` per worktree** costs a minute or two each (no browser download —
  system Edge). Waves of 2–4 are the sweet spot.
- **Nested subagents.** Each `task-implementer` spawns a `qa-reviewer` (which may
  in turn consult `budgeting-finance-expert` on money diffs). If the runtime
  forbids that nesting, the agent falls back to running the gate inline — its
  report will say so; that's not a launcher failure.
- **Atomic, always.** Every claim is an atomic git ref; every merge is all-or-
  nothing with an abort path. The base is green after each step. That's what lets
  this run autonomously without ever stranding the team branch.
