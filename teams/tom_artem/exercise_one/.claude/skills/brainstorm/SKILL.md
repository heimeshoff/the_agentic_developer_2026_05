---
name: brainstorm
description: Facilitate a structured feature brainstorming session for the personal finance app. Use this skill when the user wants to explore a new feature idea, plan what to build next, or think through a product direction. Triggers on phrases like "brainstorm", "let's think about", "what should we build", "plan a feature", or "I have an idea".
---

# Brainstorm

Help the user explore and shape a feature idea through structured thinking — from raw idea to a clear, actionable direction.

## Step 1 — understand the seed idea

If the user has not provided a feature idea yet, ask one open question:
> "What area or problem do you want to explore?"

If they already described something, confirm your understanding in one sentence before proceeding. Do not ask multiple questions at once.

## Step 2 — explore the problem space

Before jumping to solutions, frame the *why*:
- **Who benefits?** Which user or persona does this serve?
- **What's the pain?** What frustration or gap does this address in the current app?
- **How does this fit?** Is it core (income/budgeting/savings/investments), or adjacent?

Present this as a concise framing paragraph, not a questionnaire. Infer what you can from context; ask only if genuinely ambiguous.

## Step 3 — generate ideas

Produce **3–5 distinct approaches** to solving the problem. Make them meaningfully different — not just variations in naming. For each:

- Give it a short name (2–4 words)
- One sentence on what it does
- One sentence on the key trade-off (complexity, scope, user friction, etc.)

Format as a compact list. Do not go deep on any single idea yet.

## Step 4 — go deeper on the top picks

Ask the user which idea(s) resonate, or if they have no preference, pick the 2 most promising and say why.

For each selected idea, explore:
- **Core interaction:** What does the user actually do? (describe the UX in 1–2 sentences)
- **Data model hint:** What new data or state does this need?
- **Dependencies:** Does this require another feature to exist first?
- **Scope gut-check:** Is this a 30-minute spike, a half-day feature, or a larger initiative?

Keep each section tight — bullet points preferred.

## Step 5 — identify risks and open questions

Surface the top 2–3 things that could go wrong or that need a decision before building:
- Technical unknowns
- UX assumptions that need validating
- Scope creep traps
- Anything that could block the implementation

## Step 6 — produce a decision summary

End with a clear, copy-paste-friendly summary block:

---
**Feature:** [name]
**Problem it solves:** [one sentence]
**Chosen approach:** [one sentence]
**Key open questions:** [bulleted list, max 3]
**Suggested first step:** [one concrete action — e.g. "sketch the data model", "build a static mockup of X", "spike the API integration"]
---

## Step 7 — offer to act

Ask: "Ready to start building, or would you like to explore any part of this further?"

If the user says to build, pass the decision summary from Step 6 to the **`feature-builder` agent**. Do not implement the feature yourself — the feature-builder handles the full implementation, build check, and test run, and will report back when complete.
