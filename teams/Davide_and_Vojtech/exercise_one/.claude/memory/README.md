# Project memory

Durable domain knowledge that Claude should recall **on demand** — not on every turn.

## How it works

- Each `.md` file here is one **atomic** memory: a single decision, rule, or fact.
- Frontmatter `tags` are the retrieval keys.
- The `UserPromptSubmit` hook (`.claude/hooks/memory-retrieve.mjs`, wired in
  `.claude/settings.json`) reads your prompt, matches it against every file's tags,
  and injects only the top matches into context for that turn. Capped at 4 files /
  6000 chars so it never floods the window.
- No match → nothing injected. The store can grow without growing baseline context.

## Division of labour

- **`CLAUDE.md`** = always-on. Small, stable, relevant to *every* task (glossary, money rules).
- **`.claude/memory/`** = on-demand. Everything conditional lives here.

## File format

```markdown
---
id: mem-income-model
title: Income model — one-off vs recurring
tags: [income, recurring, one-off, period, money]
scope: domain        # decision | domain | convention | feature
---
The actual knowledge, in prose. Keep it to one idea.
```

## Folders

- `decisions/` — ADRs: why we chose X over Y.
- `domain/` — how the domain works: invariants, model, period semantics.
- `conventions/` — durable team/code preferences and workflow norms.
- `feature/` — context tied to features currently in flight (links to the task board).

## Adding memory

Drop a new file in the right folder, give it honest `tags`, done. Tune retrieval by
editing the hook (`MAX_FILES`, `MAX_CHARS`, scoring). Test it without a session:

```bash
echo '{"prompt":"how do we model recurring income?"}' | node .claude/hooks/memory-retrieve.mjs
```
