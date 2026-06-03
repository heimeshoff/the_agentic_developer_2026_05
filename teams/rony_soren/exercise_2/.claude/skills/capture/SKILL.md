---
name: capture
description: >
  Captures a rough idea into a refined backlog work item. Use this skill whenever the user
  says "capture this", "add to backlog", "new work item", "I want to build...", "let's add
  a feature", "capture idea", or describes something they want to implement next. Also trigger
  when the user is brainstorming and wants to turn a conversation into a concrete, trackable
  piece of work. This skill researches what already exists (code, specs, prior research) before
  drafting, then refines the item interactively with the user.
---

# Capture

Turn a rough idea into a refined, actionable backlog item. Every work item is grounded in
what the project already has — the feature spec, existing code, and any prior research.

## Workflow

### Step 1: Understand the idea

Take whatever the user said — a sentence, a paragraph, a vague wish — and restate it back
in one or two sentences to confirm you understand the intent. If the idea is ambiguous,
ask one focused clarifying question before proceeding.

### Step 2: Gather context

Read these files to understand the current state of the project:

1. **feature.md** — the feature specification. What user stories and constraints already exist?
2. **backlog.md** — if it exists, what work items are already captured? Avoid duplicates
   and find the next available WI number.
3. **Source code in src/** — scan the main `.cs` files (not obj/bin) to understand what's
   already implemented. The idea might overlap with existing functionality.
4. **Research artifacts** — check if any prior research exists (look for files like
   `research.md`, `research/` directory, or notes in `feature.md` itself). Prior research
   from the feature-researcher skill may contain domain knowledge, sources, and edge cases
   that should inform the work item.

### Step 3: Assess research needs

After gathering context, decide whether the idea touches domain concepts that the team
hasn't researched yet. Signs that more research would help:

- The idea mentions a domain term not defined in feature.md (e.g., "tax-loss harvesting",
  "rebalancing bands", "minimum trade size")
- The acceptance criteria are hard to write because you don't know the real-world rules
- The idea involves regulatory or financial concepts where getting it wrong matters

If more research is needed, tell the user:
> "This touches [concept], which isn't covered in our current research. I'd suggest running
> the feature-researcher skill first to gather domain knowledge, then coming back here
> to capture the work item. Want to do that?"

Let the user decide. If they say no, do your best with what's available.

### Step 4: Draft the work item

Write the work item in this format:

```
## WI-NNN: [Title]

**Story:** As a [role], I want [capability] so that [benefit]

**Acceptance Criteria:**
- Given [context] When [action] Then [outcome]
- Given [context] When [action] Then [outcome]

**Research:** [links, notes, or "none — consider running feature-researcher"]

**Depends on:** [WI-NNN / "none" / reference to existing user story in feature.md]

**Size:** [S / M / L]

**Status:** todo
```

Guidelines for the draft:
- **Title**: short, action-oriented (e.g., "Add transaction cost awareness to rebalance plan")
- **Story**: identify the real user and real benefit, not just "as a user I want this feature"
- **Acceptance criteria**: write 2-4 concrete Given/When/Then scenarios. Cover the happy path
  and at least one edge case. These should be specific enough that someone could write a test
  from them.
- **Research**: cite any sources found in prior research or feature.md. If no research exists
  for this area, note that explicitly.
- **Dependencies**: reference existing work items or user stories this builds on. Check if
  the idea requires something that doesn't exist yet — if so, flag it.
- **Size**: S = a few hours, M = a day, L = multiple days. Base this on what you saw in the
  codebase — if similar things already exist, it's probably smaller.

### Step 5: Refine with the user

Present the draft and ask: "How does this look? Anything to add, change, or split?"

Common refinements:
- The user might want to split a large item into smaller ones
- Acceptance criteria might need adjusting based on the user's actual intent
- Dependencies might be wrong or missing
- The user might realize they need research first after all

Iterate until the user confirms the item is ready.

### Step 6: Write to backlog

Once confirmed, append the work item to `backlog.md` in the project root.

- If `backlog.md` doesn't exist, create it with a simple header:
  ```
  # Backlog
  ```
  Then append the item below.

- If it exists, read it first to find the last WI number and increment.

After writing, confirm: "Added WI-NNN to backlog.md."

## Numbering

Work items use sequential IDs: WI-001, WI-002, etc. If backlog.md already exists,
read it to find the highest number and increment. If it doesn't exist, start at WI-001.

## Multiple items in one session

If the user wants to capture several ideas, process them one at a time through the full
workflow. Don't batch-draft — each item deserves its own context-gathering and refinement cycle.
