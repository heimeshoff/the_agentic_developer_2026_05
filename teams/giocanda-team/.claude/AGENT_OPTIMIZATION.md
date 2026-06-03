# Agent Optimization Guide

This document defines how to optimize agent and skill invocations to minimize context usage in the main orchestrator.

## Core Principles

1. **Minimal context in, minimal context out** — Only pass what's needed, return only what's actionable
2. **Right-sized models** — Use `haiku` for structured tasks, `sonnet` for complex reasoning, `opus` rarely
3. **Structured output** — Use JSON schemas to force concise, parseable responses
4. **Scope limitation** — Check specific files/paths, not entire codebases
5. **Parallel execution** — Run independent checks concurrently to reduce wall-clock time

## Model Selection Matrix

| Task Type | Model | Rationale |
|-----------|-------|-----------|
| Static validation (naming, structure) | `haiku` | Fast, deterministic checks |
| Code generation (templates, boilerplate) | `haiku` | Follows patterns well |
| Accessibility static analysis (HTML, ARIA) | `haiku` | Rule-based validation |
| Semantic code review | `sonnet` | Requires deeper understanding |
| Complex refactoring | `sonnet` | Context-aware transformations |
| Novel architecture decisions | `sonnet` | Creative problem-solving |
| Multi-system integration planning | `opus` | Rare, only when necessary |

## Agent Invocation Patterns

### Pattern 1: Single File Validation

```javascript
// ❌ BAD: Sends full context, gets verbose response
const result = await agent(
  'Check if the codebase follows conventions',
  { label: 'validate' }
);

// ✅ GOOD: Targeted, structured, uses haiku
const result = await agent(
  'Validate /teams/giocanda-team/ folder structure against /instructions/instruction.md. Check: (1) exercise_one vs exercise_1 naming, (2) git branch name matches gioconda-team, (3) no code under /instructions/. Return JSON only.',
  {
    label: 'validate-conventions',
    model: 'haiku',
    schema: {
      type: 'object',
      required: ['passes', 'warnings', 'errors'],
      properties: {
        passes: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Items that pass validation (concise list)'
        },
        warnings: { 
          type: 'array', 
          items: { 
            type: 'object',
            required: ['file', 'line', 'issue', 'fix'],
            properties: {
              file: { type: 'string' },
              line: { type: 'number' },
              issue: { type: 'string', maxLength: 100 },
              fix: { type: 'string', maxLength: 150 }
            }
          }
        },
        errors: { 
          type: 'array', 
          items: { 
            type: 'object',
            required: ['file', 'line', 'issue', 'fix'],
            properties: {
              file: { type: 'string' },
              line: { type: 'number' },
              issue: { type: 'string', maxLength: 100 },
              fix: { type: 'string', maxLength: 150 }
            }
          }
        }
      }
    }
  }
);

// Orchestrator processes concisely
if (result.errors.length > 0) {
  // Fix errors
} else if (result.warnings.length > 0) {
  // Report warnings
}
```

### Pattern 2: Parallel File Checks

```javascript
// ❌ BAD: Sequential, sends full context each time
for (const file of changedFiles) {
  await agent(`Check accessibility of ${file}`);
}

// ✅ GOOD: Parallel, minimal context per agent
const a11yResults = await pipeline(
  changedFiles.filter(f => f.match(/\.(tsx|vue|html)$/)),
  file => agent(
    `Accessibility check for ${file}. Read the file, validate WCAG 2.1 AA compliance. Report critical/important issues only.`,
    {
      label: `a11y:${file.split('/').pop()}`,
      model: 'haiku',
      phase: 'Accessibility Validation',
      schema: {
        type: 'object',
        properties: {
          file: { type: 'string' },
          critical: { 
            type: 'array', 
            items: {
              type: 'object',
              required: ['line', 'issue', 'fix', 'wcag'],
              properties: {
                line: { type: 'number' },
                issue: { type: 'string', maxLength: 100 },
                fix: { type: 'string', maxLength: 150 },
                wcag: { type: 'string', pattern: '^[0-9]\\.[0-9]\\.[0-9]$' }
              }
            }
          },
          important: { type: 'array', items: { /* same schema */ } }
        }
      }
    }
  )
);

// Orchestrator synthesizes results
const allCritical = a11yResults.filter(Boolean).flatMap(r => r.critical);
```

### Pattern 3: Focused Code Generation

```javascript
// ❌ BAD: Open-ended, verbose instructions
const component = await agent(
  'Build an accessible transaction form following all best practices',
  { agentType: 'a11y-developer' }
);

// ✅ GOOD: Specific scope, framework known, haiku sufficient
const component = await agent(
  'Generate React transaction form component. Fields: date (date picker), amount (number), category (select), notes (textarea). Must have: labels, ARIA, keyboard nav, 4.5:1 contrast. Return: (1) component code, (2) keyboard shortcuts list, (3) screen reader notes. Framework: React 18 + TypeScript.',
  {
    label: 'gen:TransactionForm',
    agentType: 'a11y-developer',
    model: 'haiku', // Override agent default if needed
    schema: {
      type: 'object',
      required: ['code', 'keyboard', 'screenReader'],
      properties: {
        code: { type: 'string', description: 'Full component code' },
        keyboard: { 
          type: 'array', 
          items: { type: 'string' },
          maxItems: 5,
          description: 'Key shortcuts (e.g., "Tab: next field")'
        },
        screenReader: { 
          type: 'array', 
          items: { type: 'string' },
          maxItems: 5,
          description: 'What will be announced'
        },
        contrastValues: {
          type: 'array',
          items: { type: 'string' },
          description: 'Color pairs and ratios (e.g., "#333 on #fff: 12:1")'
        }
      }
    }
  }
);

// Orchestrator writes code, reports key info to user
Write({ file_path: 'src/components/TransactionForm.tsx', content: component.code });
// Brief summary to user
log(`Generated TransactionForm. Keyboard: ${component.keyboard.join(', ')}`);
```

### Pattern 4: Documentation Alignment Check

```javascript
// ❌ BAD: Re-reads everything, verbose diff
const alignment = await agent(
  'Check if our CLAUDE.md matches workshop instructions',
  { agentType: 'doc-fixer' }
);

// ✅ GOOD: Provides exact paths, structured diff, haiku
const alignment = await agent(
  'Compare /teams/giocanda-team/CLAUDE.md against /instructions/instruction.md and /instructions/exercise_one/instruction.md. Check: (1) exercise naming convention, (2) git workflow, (3) folder structure rules. Return misalignments with line numbers and corrections.',
  {
    label: 'doc-alignment',
    agentType: 'doc-fixer',
    model: 'haiku',
    schema: {
      type: 'object',
      properties: {
        misalignments: {
          type: 'array',
          items: {
            type: 'object',
            required: ['file', 'line', 'current', 'expected', 'source'],
            properties: {
              file: { type: 'string', description: 'File path' },
              line: { type: 'number', description: 'Line number' },
              current: { type: 'string', maxLength: 100, description: 'Current text' },
              expected: { type: 'string', maxLength: 100, description: 'Correct text' },
              source: { type: 'string', description: 'Source instruction file reference' }
            }
          }
        }
      }
    }
  }
);

// Orchestrator applies fixes efficiently
for (const m of alignment.misalignments) {
  Edit({ file_path: m.file, old_string: m.current, new_string: m.expected });
}
```

## Communication Protocol

### Orchestrator → Agent

**Essential context only:**
- Task description (1-2 sentences)
- File paths (specific, not glob patterns)
- Framework/tech stack (if relevant)
- Output format expectation (JSON schema)

**Exclude:**
- Full git history
- Unrelated business logic
- Entire codebase structure
- Previous conversation context (unless directly relevant)

### Agent → Orchestrator

**Return only:**
- Structured data (JSON matching schema)
- File paths with line numbers for issues
- Concise fix descriptions (≤150 chars)
- Specific code changes (diffs, not explanations)

**Exclude:**
- Verbose explanations
- Teaching content
- Historical context
- Exploratory reasoning

## Workflow Optimization

### Example: Pre-commit Accessibility Audit

```javascript
export const meta = {
  name: 'pre-commit-a11y',
  description: 'Fast accessibility check before commit',
  phases: [
    { title: 'Detect Changed Files', detail: 'Find UI files in git diff' },
    { title: 'Validate Accessibility', detail: 'Parallel WCAG checks', model: 'haiku' },
    { title: 'Report Issues', detail: 'Structured summary' }
  ]
};

phase('Detect Changed Files');
const changed = (await agent(
  'Run git diff --name-only HEAD. Return array of changed .tsx/.vue/.html files under src/',
  {
    schema: { type: 'object', properties: { files: { type: 'array', items: { type: 'string' } } } }
  }
)).files;

if (changed.length === 0) {
  return { status: 'skip', reason: 'No UI files changed' };
}

phase('Validate Accessibility');
const results = await pipeline(
  changed,
  file => agent(
    `A11y check: ${file}. WCAG 2.1 AA. Return critical/important issues with line numbers.`,
    {
      label: `a11y:${file.split('/').pop()}`,
      model: 'haiku',
      phase: 'Validate Accessibility',
      schema: {
        type: 'object',
        properties: {
          critical: { type: 'array', items: { /* issue schema */ } },
          important: { type: 'array', items: { /* issue schema */ } }
        }
      }
    }
  )
);

phase('Report Issues');
const allCritical = results.filter(Boolean).flatMap(r => r.critical);
const allImportant = results.filter(Boolean).flatMap(r => r.important);

return {
  status: allCritical.length > 0 ? 'fail' : 'pass',
  critical: allCritical,
  important: allImportant,
  summary: `${changed.length} files checked, ${allCritical.length} critical, ${allImportant.length} important`
};
```

**Token savings:**
- Each agent reads only one file (not entire codebase)
- Haiku uses 10x fewer tokens than Sonnet
- Parallel execution: 5 files checked in ~same time as 1
- Structured output: no parsing needed in orchestrator
- Main agent receives only actionable summary

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Chatty Agents

```javascript
// Agent returns verbose explanation
return {
  result: 'I analyzed the file and found several issues...',
  details: 'First, I noticed that on line 45 there is a div element...',
  recommendations: 'Based on WCAG guidelines, I suggest...'
};
```

**Fix:** Use JSON schema to enforce structure.

### ❌ Anti-Pattern 2: Over-Contextualization

```javascript
// Sending full codebase context to check one file
const result = await agent(
  'Here is the entire project structure... [10,000 lines] ...now check if Button.tsx is accessible'
);
```

**Fix:** Send only the file path, let agent read it.

### ❌ Anti-Pattern 3: Wrong Model Size

```javascript
// Using Opus for simple naming check
const validation = await agent(
  'Check if folder is named exercise_one or exercise_1',
  { model: 'opus' }
);
```

**Fix:** Use `haiku` for deterministic checks.

### ❌ Anti-Pattern 4: Sequential When Parallel Fits

```javascript
// Checking files one by one
for (const file of files) {
  await agent(`Check ${file}`); // Blocks on each
}
```

**Fix:** Use `pipeline()` or `parallel()`.

### ❌ Anti-Pattern 5: Open-Ended Responses

```javascript
// No schema, agent returns free-form text
const review = await agent('Review this code for accessibility');
// Returns: "This code has several issues. The first one is..."
```

**Fix:** Use JSON schema to force structured output.

## Measuring Optimization

Track these metrics:

1. **Context size per invocation** — Aim for <5K tokens per agent call
2. **Model distribution** — 70%+ calls should be haiku, <5% opus
3. **Response structure** — 100% should return JSON (via schema)
4. **Parallelization rate** — Independent tasks should run concurrently
5. **Orchestrator token usage** — Main agent should stay under 50K/turn

## Quick Reference

| Scenario | Model | Schema? | Parallel? |
|----------|-------|---------|-----------|
| Naming/structure validation | haiku | Yes | N/A |
| Accessibility static analysis | haiku | Yes | Yes (per file) |
| Code generation (templates) | haiku | Yes | Yes (per component) |
| Documentation alignment | haiku | Yes | No |
| Semantic code review | sonnet | Yes | Yes (per file) |
| Architecture refactoring | sonnet | Yes | No |
| Novel design decisions | sonnet | Maybe | No |

## Integration with Existing Agents

All agents have been updated with "Context Expectations" sections:
- `/teams/giocanda-team/.claude/agents/a11y-developer.md` — Now uses `haiku` by default
- `/teams/giocanda-team/.claude/agents/doc-fixer.md` — Now uses `haiku` by default
- `/teams/giocanda-team/.claude/skills/validate-conventions.md` — Includes invocation examples
- `/teams/giocanda-team/.claude/skills/accessibility-check.md` — Includes invocation examples

Refer to those files for specific invocation patterns.
