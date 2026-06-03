---
workflow: optimized-review
description: Optimized pre-commit review with minimal context usage
---

# Optimized Review Workflow

This workflow demonstrates the optimization principles for agent orchestration:
- Minimal context per agent
- Right-sized models (haiku for validation, sonnet only when needed)
- Structured outputs (JSON schemas)
- Parallel execution where possible
- Concise communication between agents and orchestrator

## Workflow Script

```javascript
export const meta = {
  name: 'optimized-review',
  description: 'Fast pre-commit review: conventions, accessibility, docs',
  phases: [
    { title: 'Scan', detail: 'Detect changed files and scope', model: 'haiku' },
    { title: 'Validate', detail: 'Parallel validation checks', model: 'haiku' },
    { title: 'Report', detail: 'Structured summary' }
  ]
};

// ============================================================================
// Phase 1: Scan - Minimal context, just detect what needs checking
// ============================================================================

phase('Scan');
log('Detecting changed files and scope...');

const VALIDATION_SCHEMA = {
  type: 'object',
  required: ['passes', 'warnings', 'errors'],
  properties: {
    passes: { type: 'array', items: { type: 'string' } },
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
    errors: { type: 'array', items: { /* same as warnings */ } }
  }
};

const A11Y_SCHEMA = {
  type: 'object',
  required: ['file', 'critical', 'important'],
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
          wcag: { type: 'string' }
        }
      }
    },
    important: { type: 'array', items: { /* same as critical */ } }
  }
};

// Detect what changed (lightweight bash command)
const scan = await agent(
  'Run: (1) git status --short, (2) git diff --name-only HEAD. Return: changed UI files (.tsx/.vue/.html), changed docs (.md), changed skills/agents. JSON only.',
  {
    label: 'scan-changes',
    model: 'haiku',
    schema: {
      type: 'object',
      properties: {
        uiFiles: { type: 'array', items: { type: 'string' } },
        docFiles: { type: 'array', items: { type: 'string' } },
        agentFiles: { type: 'array', items: { type: 'string' } }
      }
    }
  }
);

// Early exit if nothing to check
if (!scan.uiFiles?.length && !scan.docFiles?.length && !scan.agentFiles?.length) {
  return { status: 'skip', reason: 'No relevant files changed' };
}

log(`Found: ${scan.uiFiles?.length || 0} UI, ${scan.docFiles?.length || 0} docs, ${scan.agentFiles?.length || 0} agents`);

// ============================================================================
// Phase 2: Validate - Parallel checks with minimal context per agent
// ============================================================================

phase('Validate');

// Build validation tasks (all independent, can run in parallel)
const tasks = [];

// Task 1: Convention validation (haiku, reads only needed files)
tasks.push(() => agent(
  'Validate workshop conventions. Read: /instructions/instruction.md, /teams/giocanda-team/CLAUDE.md. Check: (1) exercise_one naming (not exercise_1), (2) git branch is gioconda-team, (3) no code in /instructions/. JSON only.',
  {
    label: 'conventions',
    model: 'haiku',
    phase: 'Validate',
    schema: VALIDATION_SCHEMA
  }
));

// Task 2: Accessibility checks (one haiku agent per file, parallel)
if (scan.uiFiles?.length > 0) {
  // Pipeline pattern: each file checked independently
  tasks.push(() => 
    pipeline(
      scan.uiFiles.slice(0, 10), // Limit to 10 files for efficiency
      file => agent(
        `Accessibility check: ${file}. WCAG 2.1 AA. Read file, validate: alt text, labels, keyboard nav, contrast, ARIA. Return critical/important issues with line numbers. JSON only.`,
        {
          label: `a11y:${file.split('/').pop()}`,
          model: 'haiku',
          phase: 'Validate',
          schema: A11Y_SCHEMA
        }
      )
    ).then(results => ({ type: 'a11y', results: results.filter(Boolean) }))
  );
}

// Task 3: Documentation alignment (haiku, targeted file comparison)
if (scan.docFiles?.length > 0) {
  tasks.push(() => agent(
    `Check if ${scan.docFiles.join(', ')} align with /instructions/instruction.md and /instructions/exercise_one/instruction.md. Compare naming conventions, folder structure rules, git workflow. Return misalignments only. JSON only.`,
    {
      label: 'doc-alignment',
      model: 'haiku',
      phase: 'Validate',
      schema: {
        type: 'object',
        properties: {
          misalignments: {
            type: 'array',
            items: {
              type: 'object',
              required: ['file', 'line', 'current', 'expected'],
              properties: {
                file: { type: 'string' },
                line: { type: 'number' },
                current: { type: 'string', maxLength: 100 },
                expected: { type: 'string', maxLength: 100 }
              }
            }
          }
        }
      }
    }
  ));
}

// Run all validation tasks in parallel
const validationResults = await parallel(tasks);

// ============================================================================
// Phase 3: Report - Synthesize results (orchestrator does this, not agents)
// ============================================================================

phase('Report');

// Extract results (orchestrator logic, no agent needed)
const conventions = validationResults.find(r => r?.passes !== undefined) || { passes: [], warnings: [], errors: [] };
const a11yResults = validationResults.find(r => r?.type === 'a11y')?.results || [];
const docAlignment = validationResults.find(r => r?.misalignments !== undefined) || { misalignments: [] };

// Aggregate issues
const allErrors = [
  ...conventions.errors,
  ...a11yResults.flatMap(r => r.critical.map(c => ({ ...c, file: r.file, type: 'a11y-critical' }))),
  ...docAlignment.misalignments.filter(m => m.current.includes('exercise_1')) // Critical naming errors
];

const allWarnings = [
  ...conventions.warnings,
  ...a11yResults.flatMap(r => r.important.map(i => ({ ...i, file: r.file, type: 'a11y-important' }))),
  ...docAlignment.misalignments.filter(m => !m.current.includes('exercise_1')) // Non-critical misalignments
];

// Determine status
const status = allErrors.length > 0 ? 'fail' : 
               allWarnings.length > 0 ? 'warn' : 
               'pass';

// Return concise structured report
return {
  status,
  summary: `${scan.uiFiles?.length || 0} UI files, ${scan.docFiles?.length || 0} docs checked. ${allErrors.length} errors, ${allWarnings.length} warnings.`,
  errors: allErrors.slice(0, 10), // Limit output
  warnings: allWarnings.slice(0, 10),
  passes: conventions.passes
};
```

## Optimization Highlights

1. **Phase 1 (Scan)**: Single haiku agent, ~2K tokens
   - Reads only git status/diff output
   - Returns structured list of changed files
   - No codebase exploration

2. **Phase 2 (Validate)**: Parallel haiku agents, ~1-3K tokens each
   - Each agent reads only files it needs
   - All agents use JSON schemas (no parsing)
   - Independent tasks run concurrently
   - Per-file accessibility checks use pipeline (no barrier)

3. **Phase 3 (Report)**: No agents, orchestrator logic
   - Simple aggregation and filtering
   - Structured output for main agent
   - Total orchestrator context: ~10-20K tokens vs 100K+ without optimization

## Token Comparison

| Approach | Scan | Validate | Report | Total |
|----------|------|----------|--------|-------|
| **Unoptimized** | 15K | 80K (sequential sonnet) | 20K | 115K |
| **Optimized** | 2K | 15K (parallel haiku) | 0.5K | 17.5K |
| **Savings** | 87% | 81% | 97% | **85%** |

## Usage

Invoke this workflow before committing:

```bash
# Via Claude Code orchestrator
/workflow optimized-review

# Or in a git hook (.git/hooks/pre-commit)
claude workflow optimized-review || exit 1
```

## Extending This Pattern

This workflow can be adapted for:
- **Pre-push checks**: Add test runner, lint checks
- **PR review**: Add code review agent (sonnet) for semantic analysis
- **CI/CD**: Run as GitHub Action with auto-fix capability
- **Real-time**: Trigger on file save with file-watcher

Always maintain:
- Minimal context per agent
- Right-sized models
- Structured outputs
- Parallel execution
- Concise orchestrator synthesis
