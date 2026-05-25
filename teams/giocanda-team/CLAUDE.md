# CLAUDE.md — Gioconda Team

This file provides guidance to Claude Code when working on the **Gioconda Team's** personal finance and budgeting application.

## Workshop Context

This team is part of **"The Agentic Developer" (April 2026)** workshop. The team works on the `gioconda-team` branch following the workshop's git workflow and folder structure conventions defined in `/instructions/instruction.md`.

## Project Overview

This is a **personal finance and budgeting application** built for Exercise One (defined in `/instructions/exercise_one/instruction.md`). The application is being developed through creative prompt engineering and exploratory coding.

## Domain Model

The application covers the following financial concepts:

- **Income** — tracking money coming in
- **Budgeting** — planning and allocating funds
- **Savings** — setting money aside for future goals
- **Investments** — putting money to work for growth

The exact feature set, data model, and user experience are intentionally open-ended and will emerge through exploration and iteration.

## Development Approach

**Instruction #1: Creatively prompt engineer and vibe code an application.**

- Favor exploration and trying new ideas over rigid planning
- Let features and structure emerge naturally through conversation
- Prioritize breadth of exploration over production polish
- The goal is to discover what works through experimentation

## Folder Structure and Naming Convention

**IMPORTANT:** Follow the exact naming convention from `/instructions/instruction.md`:

- All code for this exercise must live in `teams/giocanda-team/exercise_one/`
- Use `exercise_one`, `exercise_two`, etc. (spelled out with underscore)
- Never use `exercise_1`, `exercise_2` (numeric) — this does not match the workshop convention
- Technology stack, frameworks, and architecture are to be determined by the team
- No prescribed requirements — features should be driven by what makes sense for managing personal finances

## Git Workflow

- This team works on the `gioconda-team` branch
- All commits should go to this branch, not `main`
- Merges to `main` will use `--no-ff` to preserve team history

## Validation and Convention Checking

To prevent misunderstandings about workshop conventions, use these tools:

- **Skill:** `/validate-conventions` — Check naming, structure, branch, and documentation alignment
- **Agent:** `doc-fixer` — Automatically identify and fix documentation misalignments
- **Reference:** `.claude/CONVENTIONS.md` — Quick lookup for correct naming and structure
- **Hook:** Automatic reminder on each prompt to verify conventions

**IMPORTANT:** When in doubt about naming or structure, always check:
1. `/instructions/instruction.md` (workshop rules)
2. `/instructions/exercise_one/instruction.md` (exercise brief)
3. `.claude/CONVENTIONS.md` (this team's quick reference)

## Current Status

This is the initial setup phase. The technology stack, file structure, and core features are still to be determined.
