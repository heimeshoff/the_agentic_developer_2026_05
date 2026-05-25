# Workshop Conventions Quick Reference

This file serves as a quick reference to prevent common misunderstandings. Always defer to `/instructions/instruction.md` as the source of truth.

## ✅ Correct Naming

```
teams/giocanda-team/exercise_one/
teams/giocanda-team/exercise_two/
/instructions/exercise_one/instruction.md
```

## ❌ Wrong Naming (DO NOT USE)

```
teams/giocanda-team/exercise_1/     ← NO! Use exercise_one
teams/giocanda-team/exercise_2/     ← NO! Use exercise_two
exercise1/                          ← NO! Use exercise_one
```

## Folder Structure

```
teams/
  giocanda-team/              ← Team name (note: might be gioconda-team in branch)
    .claude/                  ← Team-specific Claude config
      CLAUDE.md               ← Team documentation
      settings.json           ← Hooks and permissions
      agents/                 ← Custom agents
      skills/                 ← Custom skills
    exercise_one/             ← Exercise code goes here
      (your application)
    exercise_two/             ← Future exercises
```

## Git Workflow

- **Work on:** `gioconda-team` branch (check: `git branch`)
- **Never work on:** `main` branch directly
- **Merge with:** `git merge --no-ff` (preserve history)

## Common Mistakes to Catch

1. **Using numeric format** for exercises (exercise_1 instead of exercise_one)
2. **Wrong branch** - working on main instead of gioconda-team
3. **Wrong folder name** - giocanda vs gioconda (team name inconsistency)
4. **Putting code in instructions/** - team code belongs in teams/ only
5. **Fast-forward merges** - always use --no-ff

## How to Validate

Run: `/validate-conventions` (custom skill)

Or manually check:
```bash
# Check current branch
git branch

# List team structure
ls -R teams/giocanda-team/

# Search for naming violations
grep -r "exercise_[0-9]" teams/giocanda-team/ --exclude-dir=node_modules
```

## When You Notice a Misunderstanding

1. Read the relevant `/instructions/*.md` file
2. Update `CLAUDE.md` with correct understanding
3. Fix any files that used wrong conventions
4. Add warning/clarification to prevent repeat
5. Consider updating this CONVENTIONS.md file

## Auto-Validation

The `.claude/settings.json` hook will remind you to check conventions on each prompt. The reminder is intentionally lightweight - you should actively verify when:

- Creating new folders/files
- Referencing exercise names
- Writing documentation
- Before committing code
