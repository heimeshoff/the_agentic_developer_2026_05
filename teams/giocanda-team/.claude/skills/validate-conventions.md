---
skill: validate-conventions
description: Validate that the team is following workshop naming conventions and structure
---

# Validate Workshop Conventions

This skill validates that the Gioconda team's work follows the workshop conventions defined in `/instructions/instruction.md`.

## What to check

1. **Naming conventions**
   - Verify all exercise folders use `exercise_one`, `exercise_two` format (spelled out with underscore)
   - Flag any `exercise_1`, `exercise_2` (numeric) references or folders
   - Check CLAUDE.md references for correct naming

2. **Folder structure compliance**
   - Ensure code lives under `teams/giocanda-team/exercise_*/`
   - Verify no team code exists under `instructions/`
   - Check that team folder name is consistent (giocanda-team vs gioconda-team)

3. **Git branch alignment**
   - Confirm current branch is `gioconda-team` (not `main`)
   - Verify team branch exists and is active

4. **CLAUDE.md accuracy**
   - Check if CLAUDE.md reflects current exercise instructions
   - Verify references to instruction files are correct
   - Ensure domain model matches exercise brief

## Process

1. Run git status to check current branch
2. List team folder structure under `teams/giocanda-team/`
3. Scan for naming violations (grep for `exercise_[0-9]`)
4. Read current CLAUDE.md and compare against `/instructions/exercise_one/instruction.md`
5. Report findings with specific file paths and line numbers
6. Suggest corrections if violations found

## Output format

Provide a concise report:
- ✅ Items that pass validation
- ⚠️ Warnings (inconsistencies that should be reviewed)
- ❌ Errors (violations of workshop conventions)
- 🔧 Suggested fixes with exact commands or file edits
