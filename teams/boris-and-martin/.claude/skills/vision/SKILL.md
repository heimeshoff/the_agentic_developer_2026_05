---
name: vision
description: Generate or update the project vision document (vision.md) for the team's Flutter personal finance app. Use this skill whenever the user asks to create a vision doc, write up the project vision, capture "what we're building", document guiding principles, or record the team's goals and architectural rationale. Triggers on phrases like "create a vision", "write our vision", "document the vision", "vision.md", "what are we building", "capture our goals", even if they don't use the exact word "vision".
---

Synthesize the team's context into a concise, opinionated `vision.md` that helps the team make decisions faster.

## Step 1 — Gather context

The CLAUDE.md files for this project are already in your context. Extract:

- **Domain**: what the app covers (income, budgeting, savings, investments)
- **Tech stack**: Flutter, why it was chosen, what it enables
- **Architecture**: event sourcing — what that means for this app
- **Quality bar**: correct calculations (primary), web-first (primary form factor)
- **Workshop intent**: vibe coding, exploring how to work with AI agents

If any of these feel thin — especially domain depth or architectural implications — use the `/research` skill with a focused question before writing. One research call at most; don't expand scope.

## Step 2 — Write vision.md

Save to `teams/boris-and-martin/exercise_one/vision.md`. Create `exercise_one/` if it doesn't exist yet.

Use exactly this structure:

```markdown
# Vision — [App Name or working title]

> [One sentence: what it is, who it's for]

## What We're Building

[2–3 sentences. Concrete product description — what does a user actually do with this? What does it feel like?]

## Why

[2–3 sentences. Why this domain for the workshop? What's the real goal — learning to work with AI agents, not shipping a product. What would make this exercise a success?]

## Architecture

Bullet list — each decision gets one line of rationale:

- **Flutter (web-first)**: [why — single codebase, web as primary form factor, what this means for trade-offs]
- **Event sourcing**: [why — append-only log, state derived from replay, what this means for how we model features]
- **[Any other decisions that emerge from context]**

## Quality Bar

[What "done well" means for this project. Be concrete. The CLAUDE.md is explicit: calculations must be correct above all else, and the web build is the primary form factor.]

## Guiding Principles

3–5 short principles — actionable rules the team can actually apply when trade-offs come up. Each one should help someone decide what to do in an ambiguous situation. Bad: "Write clean code." Good: "Model new features as events first, projections second — if you're reaching for mutable state, stop and rethink."
```

## Tone and intent

Write in first-person plural ("we"). Be specific and opinionated — a vision doc that tries not to offend anyone is useless. Every sentence should help someone make a faster decision.

Don't just paraphrase the CLAUDE.md. Synthesize: pull out the *implications* of the decisions, not just the decisions themselves. The guiding principles especially should feel earned, not obvious.

## Step 3 — After writing

Tell the user where the file lives and ask if they'd like to tweak anything. Offer to commit with `/commit` once they're happy.
