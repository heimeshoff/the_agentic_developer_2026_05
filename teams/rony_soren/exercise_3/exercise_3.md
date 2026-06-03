# Exercise 3: Optimizing Agents for Minimal Orchestrator Context

## Task

> Optimize your agents for the smallest context of the main agent/orchestrator.
> Each agent or skill invoking a sub-agent should use an optimized LLM model and
> communicate effectively — invoked with only the context that is needed and helpful,
> returning only what is necessary.

## Starting point (from exercise 2)

- A complete C#/.NET portfolio rebalancing app under `src/Rebalancer/` (domain types
  `TargetAllocation`/`Holding`/`Trade`, a `Rebalance()` algorithm, 12 passing tests).
- Three skills: **capture** (idea → backlog work item), **implement** (backlog item →
  TDD code via sub-agent), **feature-researcher** (domain research to enrich `feature.md`).
- Interaction pattern: main thread plans → one big sub-agent prompt → main thread verifies.
  Ran at ~55k tokens / 27% context.

## Context-optimization opportunities identified

1. **Model selection** — sub-agents were defaulting to Opus. Research and straightforward
   TDD coding can run on a smaller, faster model to shrink cost and footprint.
2. **Bloated skill prompts** — `capture` (~126 lines) and `implement` (~123 lines) load into
   the main context on every use. Detail belongs in the sub-agent, not the orchestrator.
3. **Return values** — sub-agents returned long narrative reports; they should return only
   structured results (files changed, test pass/fail, errors).
4. **Context fed to sub-agents** — `implement` told the sub-agent to explore 4+ files rather
   than handing it just the relevant slices.

## What we did this session

- Set the default model to **Opus 4.8** (low effort) for the orchestrator.
- Created two dedicated sub-agents (`.claude/agents/`) so the orchestrator delegates rather
  than carrying the work in its own context:

### `implement-skill-executor` (model: **sonnet**)
A delegated implementation engineer. Takes a self-contained spec (file paths, changes,
expected tests, build/test commands) and produces working, verified code. Runs on **Sonnet**
to keep delegated coding cheap and isolated. Key contract:
- Restate task; ask only if material info is missing.
- Regression-cover existing code before modifying; full coverage for new features.
- Build with `dotnet build Rebalancer.slnx`, test with `dotnet test Rebalancer.slnx`.
- Returns a **concise structured report**: summary, files changed, tests + results,
  verification commands, notes/follow-ups.
- Never commits/pushes unless explicitly instructed and permitted.

### `capture-skill-invoker` (model: **opus**)
A thin specialist whose sole job is to invoke the `capture` skill reliably — discover the
skill, gather required inputs, invoke once, then report what was captured in 1–3 sentences.
Stays strictly in scope (no code edits, no destructive actions).

## Effect on orchestrator context

- Heavy work (coding, TDD, verification) now runs inside `implement-skill-executor` on
  Sonnet, isolated from the main window.
- Sub-agents return structured summaries, not transcripts — the orchestrator absorbs only
  the conclusion (files changed, pass/fail), not the 25-tool-call trace.
- The orchestrator stays on Opus 4.8 (low effort) for planning, review, and user interaction.

## Follow-ups

- Trim the `capture`/`implement` SKILL.md prompts so less loads into the main context.
- Consider moving `feature-researcher` onto a sub-agent with a smaller model too.
- Pass relevant file slices to sub-agents instead of asking them to explore.
