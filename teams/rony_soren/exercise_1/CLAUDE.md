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

_No commands yet._ Fill in as tooling is added:

```
# Build:
# Test (all):
# Test (single):
# Lint:
# Dev server:
```

## Architecture

_No code yet._ Update this section as the application takes shape — describe the high-level structure, key modules, and data flow so future sessions can orient quickly.
