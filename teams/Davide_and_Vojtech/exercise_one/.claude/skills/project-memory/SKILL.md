---
name: project-memory
description: Capture, curate, and search the on-demand project memory store at `.claude/memory/` for the personal-finance app. Use this WHENEVER the user signals a durable fact or decision worth keeping — "remember this", "we decided X", "capture this", "note for later", "add to memory", "store this", "from now on", "for future reference", "we should remember" — or asks to refine/clean up memory, or when you suspect a relevant past decision exists but the auto-loaded context didn't surface it. Writing memory is something you must choose to do, so lean toward using this skill rather than letting a decision evaporate. Does NOT handle reading on every turn — a UserPromptSubmit hook already auto-injects matching memory; this skill is the write / curate / deliberate-search side.
---

# Project memory

The repo has an **on-demand memory system** so durable domain knowledge is recalled only
when relevant, instead of bloating `CLAUDE.md` (which loads in full every turn).

- **Reading is automatic.** A `UserPromptSubmit` hook (`.claude/hooks/memory-retrieve.mjs`)
  injects the top tag-matching memory files into context on every prompt. You don't invoke
  that — it just happens. **Don't try to reproduce it.**
- **Writing and curating is your job** — and the reason this skill exists. Capturing a
  decision is an act of judgement the hook can't perform, so when a durable fact goes by,
  catch it.

Read `.claude/memory/README.md` once for the format if you haven't this session.

## When to capture

Capture when a fact will still matter next week and isn't already written down:

- A **decision** with a rationale ("we'll store periods as `YYYY-MM`", "discretionary rolls over").
- A **domain rule or model** detail ("an actual income entry may confirm an expected one").
- A durable **convention/preference** ("we always colocate tests", "label commits `[t-NNN]`").
- **Feature context** worth carrying across sessions (how a slice is wired, open questions).

Don't capture: transient task state (that's the `tasks/` board), or universal rules that
must apply to *every* turn — those belong in `CLAUDE.md`, not here (see "Curate" below).

## Step 1 — check it isn't already there

Before writing, search so you don't create a near-duplicate:

```bash
grep -rin "<keyword>" .claude/memory/
```

If a file already covers the topic, **edit that file** (add the new detail, widen its tags)
instead of adding a second one. One idea, one file — duplicates split retrieval and rot.

## Step 2 — pick the scope folder

| Folder         | What goes there                                              |
| -------------- | ----------------------------------------------------------- |
| `decisions/`   | ADRs — why we chose X over Y. The painful-to-re-derive stuff. |
| `domain/`      | How the domain works: invariants, model, period semantics.   |
| `conventions/` | Durable code/team/workflow preferences.                      |
| `feature/`     | Context tied to a feature in flight (links to the task board). |

## Step 3 — write one atomic file

Filename: `mem-<slug>.md`. Keep it to a **single idea** — small files retrieve precisely.

```markdown
---
id: mem-period-format
title: Decision — periods are stored as YYYY-MM
tags: [period, month, budget, date, format, yyyy-mm, reporting]
scope: decision
---
Budget periods persist as a `YYYY-MM` string (calendar month). Why: reports and budgets
roll up per month, and a fixed-width key keeps range queries and grouping trivial.
```

**Tags are the whole retrieval mechanism, and matching is keyword-literal** — the hook only
finds a file if a word in the user's prompt equals one of its tags. So tag **generously and
with synonyms**: include `salary` and `paycheck` alongside `income`, `month` alongside
`period`. A fact no one can retrieve is a fact you didn't save. Write the body so it stands
alone — whoever reads it won't have the conversation that produced it.

## Step 4 — verify it surfaces

Confirm a realistic prompt actually pulls the new file:

```bash
echo '{"prompt":"how do we store budget periods?"}' | node .claude/hooks/memory-retrieve.mjs
```

If your new title doesn't appear, the tags don't match how a person would ask — widen them
and retest. This closes the loop: a memory only counts once it's retrievable.

## Curate — keep the store and CLAUDE.md healthy

- **`CLAUDE.md` = always-on, small, universal.** If a rule must shape *every* turn (the money
  rules, the glossary), it stays there. If knowledge is *conditional* — only relevant to some
  tasks — move it into `.claude/memory/` so baseline context stays lean while recall improves.
- When you notice `CLAUDE.md` growing a section that's really situational, offer to migrate it
  into a memory file and trim the original to a one-line pointer.
- Prune or merge memories that have gone stale or overlap.

## Deliberate search

The auto-hook is literal, so it misses synonyms. When you suspect a relevant decision exists
but nothing was injected, **look yourself** before guessing or re-deriving:

```bash
grep -rin "currency\|fx\|exchange" .claude/memory/
ls -R .claude/memory/
```

Then read the file. Acting on a written decision beats inventing a new one that contradicts it.

## What not to do

- **Don't reproduce the read hook.** Reading on every turn is automatic; this skill is for the
  parts you have agency over — capture, curate, deliberate search.
- **Don't duplicate.** Search first; edit the existing file rather than adding a rival.
- **Don't stuff multiple ideas into one file** — it blurs tags and weakens retrieval.
- **Don't tag stingily.** Literal matching means a missing synonym = an unfindable memory.
- **Don't put universal, must-always-apply rules in memory** — those live in `CLAUDE.md`.
- **Don't store transient task state here** — that's the `tasks/` board's job.
