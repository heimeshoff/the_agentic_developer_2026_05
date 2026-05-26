---
description: Plan a feature before writing code. Usage: /plan <feature description>
---

Use the `planner` agent to create a concrete, step-by-step implementation plan for the requested feature.

Pass the full feature description (everything after `/plan`) as context to the agent. The agent will read the current exercise folder, identify what needs to change, and produce an ordered task list — without writing any code.

Do not start coding until the plan is produced and the user has acknowledged it (or asked to adjust it).
