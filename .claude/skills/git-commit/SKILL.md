---
name: git-commit
description: Stage and commit the current working tree changes with a well-formed commit message. Use when the user says "commit", "git commit", "commit my changes", or invokes /git-commit.
version: 1.0.0
---

# Git Commit Skill

Stages changes and creates a git commit with a clear, descriptive message.

## Execution Steps

### Step 1 — Inspect current state
Run these in parallel:
1. `git status` — identify modified, untracked, and deleted files.
2. `git diff` — read the full diff of unstaged changes.
3. `git diff --cached` — read the full diff of already-staged changes.
4. `git log --oneline -5` — read recent commit messages to match style.

### Step 2 — Determine what to stage
- If `$ARGUMENTS` names specific files or paths, stage only those.
- Otherwise stage all tracked modifications (`git add -u`) plus any new files that are clearly part of the current work (use judgement — do NOT stage `.env`, credential files, large binaries, or build artefacts such as `target/`, `dist/`, `node_modules/`).
- If nothing to stage, report "Nothing to commit" and stop.

### Step 3 — Draft the commit message
- First line: imperative mood, ≤72 characters, no trailing period. Summarise *what* changed.
- If useful, add a blank line then a short body explaining *why*.
- Follow the style of the five most recent commits observed in Step 1.
- Always append this trailer on its own line at the end:
  `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`

### Step 4 — Create the commit
Run `git commit -m "$(cat <<'EOF'\n<message>\nEOF\n)"` (or PowerShell equivalent) using the drafted message. Pass the full message via heredoc to avoid shell escaping issues.

### Step 5 — Confirm
Run `git log --oneline -1` and report the new commit hash and subject line to the user.

## Safety rules
- NEVER amend existing commits.
- NEVER force-push or reset.
- NEVER skip hooks (`--no-verify`).
- NEVER stage `.env`, secrets, or build artefacts.
- If the pre-commit hook fails, fix the underlying issue and re-commit rather than bypassing it.
