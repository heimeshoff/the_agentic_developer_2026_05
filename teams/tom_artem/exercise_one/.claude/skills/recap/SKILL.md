---
name: recap
description: Produce a "where we are" session-start summary for the personal finance app. Use when starting a new session, returning after a break, or when the user asks what has been built. Reads PROJECT_STATE.md and verifies it against the actual source files. Triggers on "what have we built", "where are we", "catch me up", "recap", or at the start of a session when context is unclear.
---

# Recap

Produce a concise, accurate summary of the current state of the personal finance app — what exists, what is known to be working, and what needs attention next.

## Step 1 — read project state and source structure in parallel

Issue all reads simultaneously in a single parallel batch:

- `teams/tom_artem/exercise_one/PROJECT_STATE.md`
- `teams/tom_artem/exercise_one/src/App.jsx`
- Directory listing of `teams/tom_artem/exercise_one/src/components/`
- Directory listing of `teams/tom_artem/exercise_one/src/utils/`

If `PROJECT_STATE.md` does not exist, report that and produce a best-effort recap from the source files alone.

## Step 2 — verify state against source

Cross-check the `## Component Inventory` table in `PROJECT_STATE.md` against the actual files in `src/components/`. Flag any discrepancies:

- **File in source but not in inventory** — a component was added without updating PROJECT_STATE
- **File in inventory but not in source** — an entry was recorded but the file was deleted or renamed

Note discrepancies but do not fix them — flag them at the end of the recap so the user can decide.

## Step 3 — produce the recap

Output this structured summary:

---
**Recap — Personal Finance App**
**Project:** `teams/tom_artem/exercise_one/`
**Stack:** React 18 · Vite · plain CSS · JavaScript
**Last state update:** [from the `> Last updated:` line in PROJECT_STATE.md, or "not recorded"]

### Features implemented
[For each entry in `## Features` in PROJECT_STATE.md, one line:
`- **[Feature Name]** — [problem solved, one sentence]. Files: [files created/modified].`
If no features are recorded: "None yet — the app is in its initial state (salary input, split editor, breakdown display)."]

### Current component inventory
[The `## Component Inventory` table from PROJECT_STATE.md, reproduced as-is.
If PROJECT_STATE.md doesn't exist, list the actual files found in `src/components/` instead.]

### What's working
[Based on the features list — what the user can see in the browser right now. Be specific, not generic.]

### Open questions / next priorities
[The `## Open Questions / Tech Debt` section from PROJECT_STATE.md as a prioritised list.
If empty: "No open questions recorded."]

### State integrity check
[Any discrepancies found in Step 2. If none: "PROJECT_STATE.md matches the source files."]
---

Keep each section tight. Do not pad with generic descriptions.

## Step 4 — offer next actions

After the recap, ask one of:

- If there are open questions: "There are [n] open questions — want to tackle any of these, or start something new?"
- If there are no open questions: "Everything looks clean. What do you want to build next?"
- If PROJECT_STATE.md doesn't exist: "PROJECT_STATE.md hasn't been created yet — want me to initialise it based on the current source files?"

Do not proceed to implementation — wait for the user's response.
