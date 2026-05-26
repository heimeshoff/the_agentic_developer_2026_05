---
description: Review current changes before committing
---

Use the `code-reviewer` agent to review the current git diff.

The agent will:
1. Inspect all uncommitted (and staged) changes
2. Check for bugs, security issues, and quality problems
3. Return a verdict: APPROVED or CHANGES NEEDED

If the verdict is APPROVED, proceed to `/commit`.
If CHANGES NEEDED, address the flagged items and run `/review` again before committing.
