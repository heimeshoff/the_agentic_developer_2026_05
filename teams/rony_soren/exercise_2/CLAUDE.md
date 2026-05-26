# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Stock rebalancing portfolio app** built for workshop "The Agentic Developer" (May 2026). Users define a target asset allocation, enter their current holdings, and the app calculates the trades needed to rebalance. Favour exploration and breadth over production polish.


## Team & Branch

- Team: **rony_soren**
- Trunk branch: `rony_soren` (treat as main — all work integrates here)
- All code lives under `teams/rony_soren/exercise_1/`
- Merge to repo `main` with `--no-ff` only

## Git Workflow

Trunk-based development using [mob.sh](https://mob.sh) for pair/mob programming:

- `mob start` — start or join a mob session (creates `mob/rony_soren` WIP branch)
- `mob next` — hand off to the next driver
- `mob done` — squash WIP commits back to `rony_soren` as a single clean commit
- Always commit to trunk (`rony_soren`) — no long-lived feature branches
- Keep commits small and integrate frequently

## Tech Stack

- **Language:** C# / .NET
- **Package manager:** NuGet (via `dotnet` CLI)
- **Setup:** See `install.sh` for SDK installation via Homebrew

## Build / Test / Run

```
# Build:
dotnet build Rebalancer.slnx

# Test (all):
dotnet test Rebalancer.slnx

# Test (single):
dotnet test Rebalancer.Tests --filter "FullyQualifiedName~TestName"
```

## Agent Strategy

Delegate coding work to a sub-agent (using the Agent tool) to preserve the main conversation's context window. The main thread handles planning, review, and user interaction — the sub-agent writes and tests the code.

Give each sub-agent a self-contained prompt: file paths, what to change, expected tests, and build/test commands.

## Architecture

- Source code lives in `src/`
- `src/Rebalancer/` — class library with domain types and rebalance logic
  - `Portfolio.cs` — records (`TargetAllocation`, `Holding`, `Trade`), enum (`TradeAction`), and `PortfolioValidator`
  - `PortfolioRebalancer.cs` — static `Rebalance()` method: computes trades to move from current holdings to target allocation
- `src/Rebalancer.Tests/` — xUnit tests for validation and rebalance scenarios
