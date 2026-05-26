---
name: research
description: Research a topic for the Flutter personal finance app — codebase exploration ("where is X", "how does our app do Y"), library/API lookup ("which Flutter package for X"), domain knowledge ("how does envelope budgeting work"), or architecture patterns ("event sourcing for projections"). Use this skill whenever the user asks a question that needs looking something up, comparing options, or exploring the codebase — even if they don't use the word "research".
---

Research the topic provided. If no topic was given, ask which scope (codebase / library / domain / architecture) and what the question is, then continue.

**Project context — always pass to the sub-agent:** Flutter app, event-sourced, web-first personal-finance & budgeting app. Calculations must be correct.

## Pick the right sub-agent

- **Codebase** ("where is X", "how does our app currently do Y") → `Explore` sub-agent. Read-only, fast, scoped to the repo.
- **Library / API** ("which Flutter package for X", "how does API Y work") → `general-purpose` sub-agent (has WebFetch + WebSearch).
- **Domain** ("how does envelope budgeting work", "typical chart of accounts for personal finance") → `general-purpose` sub-agent.
- **Architecture** ("event sourcing patterns for projection rebuilds", "handling backdated transactions") → `general-purpose` sub-agent.
- **Mixed** (e.g. "how do we currently do X, and what's the idiomatic Flutter way") → spawn one of each in parallel and synthesize.

## Brief the sub-agent

Give it:

1. **The question**, in plain language, with the project context above.
2. **What's already ruled out or known**, if anything.
3. **Required output shape**: under ~300 words, structured as:
   - Findings (3–6 bullets, each with a source or file:line where applicable)
   - Recommended next step
   - Open questions

Hand over the question, not the procedure. Do not prescribe how to search.

## After the agent returns

1. Summarize inline in 3–5 lines so the team can react fast.
2. **Decide whether to save a note.** Save when the topic is non-trivial:
   - Multiple options were compared, or
   - A decision was made that we'll want to revisit, or
   - Background context will outlive the current chat.
3. If saving, infer the save path from context — use the folder currently being worked in (e.g. wherever code edits or file reads have been happening this session). Write to `<inferred-folder>/research/<kebab-slug>.md`. If the folder is ambiguous, ask before saving. Format:

   ```markdown
   # <Question>

   - Date: <today>
   - Scope: codebase | library | domain | architecture

   <agent's digest, verbatim>
   ```

   Create the `research/` directory if it doesn't exist. Don't commit — let the user decide.
4. If trivial (a one-off lookup, a quick fact), skip the note. Don't write notes "for completeness".

## Don't

- Don't research and code in the same pass. Research, surface the findings, let the team decide, then code.
- Don't invent URLs, package names, or APIs. If the sub-agent didn't find evidence, say so explicitly.
- Don't expand scope. If the user asked about envelope budgeting, don't also research zero-based budgeting unless they ask.
