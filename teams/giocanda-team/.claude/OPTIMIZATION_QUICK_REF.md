# Agent Optimization Quick Reference

One-page reference for optimized agent usage.

## Model Selection (Default: Haiku)

```
haiku  → Validation, generation, static analysis (70%+ of calls)
sonnet → Semantic understanding, complex refactoring (25% of calls)
opus   → Novel architecture, multi-system planning (<5% of calls)
```

## Invocation Template

```javascript
const result = await agent(
  'Task description (1-2 sentences). Specific scope. Expected output format.',
  {
    label: 'short-name',           // For /workflows UI
    model: 'haiku',                 // Explicit is better
    phase: 'Phase Name',            // Groups in progress display
    agentType: 'custom-agent',      // Optional: use custom agent
    schema: {                       // ALWAYS use schema
      type: 'object',
      required: ['field1', 'field2'],
      properties: {
        field1: { 
          type: 'string', 
          maxLength: 100,           // Constrain output size
          description: 'What this is'
        },
        field2: { type: 'array', items: {...} }
      }
    }
  }
);
```

## Schema Templates

### Validation Result
```javascript
{
  type: 'object',
  required: ['passes', 'warnings', 'errors'],
  properties: {
    passes: { type: 'array', items: { type: 'string' } },
    warnings: { type: 'array', items: {
      type: 'object',
      required: ['file', 'line', 'issue', 'fix'],
      properties: {
        file: { type: 'string' },
        line: { type: 'number' },
        issue: { type: 'string', maxLength: 100 },
        fix: { type: 'string', maxLength: 150 }
      }
    }},
    errors: { /* same as warnings */ }
  }
}
```

### Accessibility Check
```javascript
{
  type: 'object',
  required: ['file', 'critical', 'important'],
  properties: {
    file: { type: 'string' },
    critical: { type: 'array', items: {
      type: 'object',
      required: ['line', 'issue', 'fix', 'wcag'],
      properties: {
        line: { type: 'number' },
        issue: { type: 'string', maxLength: 100 },
        fix: { type: 'string', maxLength: 150 },
        wcag: { type: 'string', pattern: '^[0-9]\\.[0-9]\\.[0-9]$' }
      }
    }},
    important: { /* same as critical */ }
  }
}
```

### Code Generation
```javascript
{
  type: 'object',
  required: ['code', 'notes'],
  properties: {
    code: { type: 'string', description: 'Full implementation' },
    notes: { 
      type: 'array', 
      items: { type: 'string' },
      maxItems: 5,
      description: 'Key points (keyboard shortcuts, screen reader behavior, etc.)'
    }
  }
}
```

## Parallel Patterns

### Pipeline (No Barrier)
```javascript
// Items flow through stages independently
const results = await pipeline(
  items,
  item => agent(`Stage 1: ${item}`, {model: 'haiku', schema: S1}),
  r1 => agent(`Stage 2: ${r1.id}`, {model: 'haiku', schema: S2})
);
```

### Parallel (Barrier)
```javascript
// Wait for ALL to complete (use sparingly)
const results = await parallel(
  items.map(item => () => agent(`Process ${item}`, {model: 'haiku', schema: S}))
);
```

**Use pipeline by default.** Only use parallel barrier when stage N genuinely needs ALL results from stage N-1 (dedup, early-exit, cross-item comparison).

## Communication Protocol

### ✅ Good Prompts
```
"Check accessibility of src/Button.tsx. WCAG 2.1 AA. Return critical/important issues with line numbers. JSON only."

"Generate React form component. Fields: name (text), email (email), submit (button). Must have: labels, ARIA, keyboard nav. Return: code + keyboard shortcuts list."

"Compare CLAUDE.md against /instructions/instruction.md. Check: naming convention, git workflow, folder structure. Return misalignments with line numbers."
```

### ❌ Bad Prompts
```
"Check the codebase for accessibility issues" // Too broad, agent reads everything

"Review this code and tell me what you think" // Open-ended, no structure

"Here is the full project... [10K lines] ...now check this one file" // Wasted context
```

## Workflow Structure

```javascript
export const meta = {
  name: 'my-workflow',
  description: 'One-line description',
  phases: [
    { title: 'Phase 1', detail: 'What it does', model: 'haiku' },
    { title: 'Phase 2', detail: 'What it does', model: 'sonnet' }
  ]
};

phase('Phase 1');
const data = await agent('...', {model: 'haiku', phase: 'Phase 1', schema: S});

phase('Phase 2');
const results = await pipeline(
  data.items,
  item => agent(`Process ${item}`, {model: 'haiku', phase: 'Phase 2', schema: S})
);

return { summary: '...', results }; // Concise structured output
```

## Existing Optimized Tools

| Tool | Model | Use For | Example |
|------|-------|---------|---------|
| `a11y-developer` | haiku | Accessible component generation | Button, form, table |
| `doc-fixer` | haiku | Documentation alignment checks | CLAUDE.md vs instructions |
| `/validate-conventions` | haiku | Naming/structure validation | exercise_one vs exercise_1 |
| `/accessibility-check` | haiku | WCAG compliance validation | Per-file or per-component |
| `optimized-review` | haiku | Pre-commit full review | Conventions + a11y + docs |

## Token Budget Guidelines

| Target | Strategy |
|--------|----------|
| <20K per workflow | Use haiku exclusively, limit file reads |
| 20-50K | Mix haiku (validation) + sonnet (review) |
| 50-100K | Add comprehensive analysis, still mostly haiku |
| 100K+ | Rare, only for full codebase audits |

## Anti-Patterns to Avoid

❌ Sending full codebase to check one file  
❌ Using sonnet/opus for simple validation  
❌ No JSON schema (free-form responses)  
❌ Sequential when parallel fits  
❌ Re-reading files orchestrator already has  
❌ Verbose explanations in agent output  
❌ Teaching content in agent responses  

## Checklist Before Invoking

- [ ] Is this the smallest model that can do the job?
- [ ] Is my prompt specific (file paths, scope)?
- [ ] Do I have a JSON schema to structure output?
- [ ] Can this run in parallel with other tasks?
- [ ] Does the agent need full context or just file paths?
- [ ] Am I using pipeline (not barrier) for multi-stage work?
- [ ] Will the response be concise and parseable?

## Further Reading

- `.claude/AGENT_OPTIMIZATION.md` — Full guide with examples
- `.claude/workflows/optimized-review.md` — Example optimized workflow
- Agent definitions in `.claude/agents/` — Context expectations per agent
- Skill definitions in `.claude/skills/` — Invocation patterns per skill
