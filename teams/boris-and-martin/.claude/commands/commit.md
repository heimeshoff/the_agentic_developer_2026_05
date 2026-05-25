---
description: Create a small git commit with a gitmoji-prefixed message
---

Create a git commit for the current changes, following our team's commit-message rules.

## Rules

- **Always prefix with gitmoji.** Every commit subject (and every bullet, if multi-line) starts with a gitmoji.
- **Prefer small, single-purpose commits.** If the staged diff is doing several unrelated things, stop and ask whether to split it before committing.
- **Single concern → one line:** `<emoji> <short subject>`
- **Multiple concerns in one commit (unavoidable only) → multi-line body:** keep a short subject, then a blank line, then one bullet per change, each bullet starting with its own gitmoji.

## Gitmoji quick reference

- ✨ new feature
- 🐛 bug fix
- ♻️ refactor (no behaviour change)
- ✅ add / update tests
- 📝 docs
- 🎨 code style / structure
- 🔧 config / tooling
- ⚡️ performance
- 🔥 remove code
- 🚧 work in progress
- 🚀 deploy / release
- 🔒 security

If none fit, pick the closest from gitmoji.dev rather than inventing one.

## Steps

1. Run `git status` and `git diff --staged` (and `git diff` for unstaged) in parallel to see what's changing.
2. If nothing is staged: figure out the smallest sensible unit to stage and stage only those files by name (never `git add -A`).
3. Run `git log -5 --oneline` to match the existing style.
4. Draft the message:
   - One concern → `<emoji> <subject>`
   - Multiple concerns → subject line + blank line + one `<emoji> <bullet>` per change
5. Commit using a heredoc so formatting is preserved:

   ```bash
   git commit -m "$(cat <<'EOF'
   <emoji> <subject>

   <emoji> <bullet 1>
   <emoji> <bullet 2>
   EOF
   )"
   ```

6. Run `git status` and `git log -1 --stat` to confirm.

Do **not** push. Do **not** amend previous commits. Do **not** use `--no-verify`.
