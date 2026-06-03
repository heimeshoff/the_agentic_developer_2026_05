# CLAUDE.md — Team boris-and-martin

Team folder for "The Agentic Developer" workshop. Code for each exercise lives under `exercise_<n>/` inside this folder.

## Exercise One — Personal Finance & Budgeting App

### Domain

Build a **personal finance and budgeting application**. The domain covers roughly:

- **Income** — money coming in
- **Budgeting** — planning where it goes
- **Savings** — setting money aside
- **Investments** — putting money to work
- ...and our own needs and behaviors

No specifics. No required features. No prescribed data model. The shape of the product is ours to discover.

### Instruction

**Creatively prompt engineer and vibe code an application.** Lean into Claude. Explore. Try things. See what emerges when the model runs with a loose brief.

Favour breadth and exploration over production polish — the workshop is about how the team *works with the agent*, not about shipping a finished product.

## Tech stack

We are building this in **Flutter**. Reasons:

- Single codebase targets native mobile apps, web, and desktop — lets us explore the app across form factors without rewriting.
- We also want to learn Flutter as a side benefit. *This learning goal is not the focus of the exercise* — the exercise is about working with the agent, so don't slow down to teach Flutter concepts unless asked.

## Architecture

The app uses **event sourcing**. State is derived by replaying an append-only log of events; do not mutate persisted state in place. New features should be modeled as events first (what happened), then projections/read models on top.

## Quality goals

1. **All calculations in the app must be correct.** This is the primary quality bar — everything else is secondary to getting the numbers right.
2. **Optimize for the web build.** Flutter targets mobile, desktop, and web from one codebase, but the web build is our primary form factor. When trade-offs come up (layout, input affordances, navigation patterns, performance budgets), pick what's best on the web — mobile and desktop should still work, but they're not where we tune.

## Development workflow

Work strictly **test-driven**, one function at a time:

1. **Write the test first.**
2. **Run the test and confirm it fails for the right reason** — not just a compile error, but a real failure because the function is not yet implemented (or returns the wrong value). If it only fails to compile, add the minimum stub needed so the failure is behavioural, then re-run.
3. **Implement the function** until the test goes green.
4. **Refactor** with the test still green — look for clarity, duplication, naming.
5. **Commit** once the refactor is done and tests are green.

Do not skip step 2. Do not batch multiple features into one cycle. Do not commit on red.

## Working conventions

- All code for this exercise goes in `teams/boris-and-martin/exercise_one/`. Never write into `instructions/`.
- **All team-specific Claude config — commands, skills, agents, hooks, settings — goes under `teams/boris-and-martin/.claude/`.** Never write to `.claude/` at the repo root; that would leak our conventions onto other teams when branches merge.
- We are on branch `teams/boris-and-martin`. Stay on it.
- When merging back to `main`, always use `git merge --no-ff` so this branch stays visible as a unit in history.
- Build/test commands for the Flutter app live inside `exercise_one/`.
