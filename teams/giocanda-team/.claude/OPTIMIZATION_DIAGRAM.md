# Agent Optimization Visual Guide

## Before vs After Architecture

### BEFORE: Unoptimized (110K tokens, 2.5 minutes)

```
┌─────────────────────────────────────────────────────────────────┐
│  Main Orchestrator (Claude)                                     │
│  Context: Full codebase + git history + conversation history    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Agent: validate-conventions (sonnet)                   │   │
│  │  Input: "Check the codebase for convention issues"      │   │
│  │  Reads: Entire /teams/ folder + all docs               │   │
│  │  Output: 3 paragraphs of explanation                    │   │
│  │  Tokens: ~12K                                           │   │
│  └────────────────────────────────────────────────────────┘   │
│                            ↓ Sequential (blocks)                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Agent: a11y-check file1.tsx (sonnet)                  │   │
│  │  Input: Full codebase context + file                    │   │
│  │  Output: Free-form text with issues                     │   │
│  │  Tokens: ~15K                                           │   │
│  └────────────────────────────────────────────────────────┘   │
│                            ↓ Sequential (blocks)                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Agent: a11y-check file2.tsx (sonnet)                  │   │
│  │  Output: More free-form text                            │   │
│  │  Tokens: ~15K                                           │   │
│  └────────────────────────────────────────────────────────┘   │
│                            ↓ (continues sequentially...)        │
│                                                                  │
│  Result: Verbose text responses → Orchestrator must parse      │
│  Main agent context grows: +110K tokens                         │
└─────────────────────────────────────────────────────────────────┘
```

### AFTER: Optimized (17K tokens, 25 seconds)

```
┌─────────────────────────────────────────────────────────────────┐
│  Main Orchestrator (Claude)                                     │
│  Context: Minimal (receives only structured summaries)          │
│                                                                  │
│  ┌──────────────────────── PHASE 1: Scan ───────────────────┐  │
│  │  Agent: scan-changes (haiku)                             │  │
│  │  Input: "Run git diff --name-only, return JSON"          │  │
│  │  Reads: Only git output                                  │  │
│  │  Schema: {uiFiles: [], docFiles: [], agentFiles: []}    │  │
│  │  Tokens: ~2K                                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────── PHASE 2: Validate (Parallel) ────────────┐   │
│  │                                                           │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌───────────┐ │   │
│  │  │ conventions    │  │ a11y: file1    │  │ doc-align │ │   │
│  │  │ (haiku)        │  │ (haiku)        │  │ (haiku)   │ │   │
│  │  │ ~2K tokens     │  │ ~1.5K tokens   │  │ ~1.8K     │ │   │
│  │  │                │  │                │  │           │ │   │
│  │  │ JSON schema →  │  │ JSON schema →  │  │ JSON sch→ │ │   │
│  │  │ {passes,       │  │ {file,         │  │ {misalign}│ │   │
│  │  │  warnings,     │  │  critical,     │  │           │ │   │
│  │  │  errors}       │  │  important}    │  │           │ │   │
│  │  └────────────────┘  └────────────────┘  └───────────┘ │   │
│  │           ↓                  ↓                  ↓       │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌───────────┐ │   │
│  │  │ a11y: file2    │  │ a11y: file3    │  │ a11y: ... │ │   │
│  │  │ (haiku)        │  │ (haiku)        │  │ (haiku)   │ │   │
│  │  │ ~1.5K tokens   │  │ ~1.5K tokens   │  │ ~1.5K     │ │   │
│  │  └────────────────┘  └────────────────┘  └───────────┘ │   │
│  │                                                           │   │
│  │  All run concurrently → Wall-clock: ~20s (not sum)      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────── PHASE 3: Report (Orchestrator) ───────────┐   │
│  │  No agent needed → Simple aggregation logic              │   │
│  │  const allErrors = results.flatMap(r => r.errors);       │   │
│  │  return {status, errors, warnings};                      │   │
│  │  Tokens: ~0.5K                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Result: Structured JSON → No parsing needed                    │
│  Main agent context grows: +17K tokens (85% reduction)          │
└─────────────────────────────────────────────────────────────────┘
```

## Token Flow Comparison

### BEFORE (Unoptimized)
```
Orchestrator sends:          Orchestrator receives:
┌──────────────────┐        ┌──────────────────────────┐
│ Full codebase    │  →  →  │ "I found several issues  │
│ Git history      │  Agent │  in the codebase. First, │
│ All docs         │        │  the naming convention   │
│ Conversation     │  ←  ←  │  is incorrect in..."     │
└──────────────────┘  25K   │ [3 paragraphs of text]   │
     15K context            └──────────────────────────┘
                                  10K response

Total per agent: 25K tokens
5 agents sequential: 125K tokens
```

### AFTER (Optimized)
```
Orchestrator sends:          Orchestrator receives:
┌──────────────────┐        ┌──────────────────────────┐
│ File path only   │  →  →  │ {                        │
│ Specific scope   │  Agent │   "errors": [            │
│ JSON schema      │        │     {file: "x", line: 5} │
└──────────────────┘  ←  ←  │   ]                      │
     0.5K context           │ }                        │
                            └──────────────────────────┘
                                  1.5K response

Total per agent: 2K tokens
5 agents parallel: 10K tokens (run concurrently)
```

## Model Selection Flow

```
                    ┌─────────────────┐
                    │  Task arrives   │
                    └────────┬────────┘
                             ↓
                    ┌────────────────┐
                    │  What type?    │
                    └────────┬───────┘
                             ↓
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │Deterministic│  │ Semantic   │  │ Novel      │
     │Validation  │  │ Analysis   │  │ Design     │
     │Generation  │  │ Refactor   │  │ Multi-sys  │
     └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
           ↓               ↓               ↓
     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │   HAIKU    │  │   SONNET   │  │    OPUS    │
     │   (70%)    │  │   (25%)    │  │    (5%)    │
     └────────────┘  └────────────┘  └────────────┘
     
     Examples:         Examples:        Examples:
     - File naming     - Code review    - Architecture
     - ARIA check      - Refactoring    - Integration
     - Struct valid    - Semantic bug   - Multi-system
     - Boilerplate     - Deep analysis  - Rare use
```

## Parallel Execution Pattern

### Sequential (BEFORE)
```
Time →
Agent 1: [████████████████████] 20s
Agent 2:                       [████████████████████] 20s
Agent 3:                                             [████████████████████] 20s
Agent 4:                                                                   [████████████████████] 20s
Agent 5:                                                                                         [████████████████████] 20s

Total: 100 seconds
```

### Parallel (AFTER)
```
Time →
Agent 1: [████████████████████] 20s
Agent 2: [████████████████████] 20s
Agent 3: [████████████████████] 20s
Agent 4: [████████████████████] 20s
Agent 5: [████████████████████] 20s

Total: 20 seconds (5x faster)
```

## Schema-Driven Output

### Without Schema (BEFORE)
```javascript
// Agent prompt: "Check accessibility"

// Agent returns free-form text:
"I analyzed the component and found three issues. 
First, the button on line 45 does not have an 
aria-label. Second, the color contrast ratio is 
only 3.2:1 which doesn't meet WCAG AA standards..."

// Orchestrator must:
1. Parse text
2. Extract file/line numbers (if present)
3. Categorize severity (not consistent)
4. Risk: parsing errors, inconsistent format
```

### With Schema (AFTER)
```javascript
// Agent prompt: "Check accessibility" + JSON schema

// Agent returns structured data:
{
  "file": "Button.tsx",
  "critical": [
    {
      "line": 45,
      "issue": "Button missing aria-label",
      "fix": "Add aria-label=\"Save changes\"",
      "wcag": "4.1.2"
    }
  ],
  "important": [
    {
      "line": 12,
      "issue": "Color contrast 3.2:1 (need 4.5:1)",
      "fix": "Use #595959 instead of #767676",
      "wcag": "1.4.3"
    }
  ]
}

// Orchestrator can:
1. Use data directly (no parsing)
2. Filter/sort by severity
3. Group by file/line
4. Guaranteed consistent format
```

## Context Minimization Strategy

```
┌─────────────────────────────────────────────────────────┐
│  What Orchestrator Knows          What Agent Needs      │
├─────────────────────────────────────────────────────────┤
│  Full codebase                →   File path only        │
│  Git history                  →   Not needed            │
│  Conversation context         →   Task description      │
│  All documentation            →   Relevant doc path     │
│  Project architecture         →   Framework name        │
│  Previous agent results       →   Not needed            │
│  Business requirements        →   Not needed            │
└─────────────────────────────────────────────────────────┘

Result: Agent reads only what it needs (1-3K tokens vs 15K)
```

## Communication Protocol

```
Orchestrator                          Agent
    │                                   │
    │  1. Specific task (1-2 sentences) │
    │  2. File path or specific scope   │
    │  3. JSON schema for output        │
    ├──────────────────────────────────→│
    │                                   │
    │                                   │  Reads only
    │                                   │  needed files
    │                                   │  (~1-2K tokens)
    │                                   │
    │  4. Structured JSON result        │
    │     (errors, warnings, passes)    │
    │←──────────────────────────────────┤
    │                                   │
    │  5. Orchestrator aggregates       │
    │     (no parsing needed)           │
    │                                   │
```

## Optimization Checklist

Before invoking an agent, verify:

```
┌─────────────────────────────────────────────┐
│ ☐ Using smallest model that can do the job │
│ ☐ Prompt is specific (file paths, scope)   │
│ ☐ JSON schema provided for output          │
│ ☐ Independent tasks run in parallel         │
│ ☐ Agent needs file path, not full content  │
│ ☐ Using pipeline (not barrier) if multi-   │
│   stage                                     │
│ ☐ Output will be concise and structured    │
└─────────────────────────────────────────────┘
```

## Real-World Impact

```
Scenario: Pre-commit review (5 UI files)

BEFORE:
├─ Token usage: 110K
├─ Wall-clock time: 150s (2.5 min)
├─ Model: Sonnet (expensive)
├─ Output: Free-form text
├─ Main context growth: +110K
└─ Parsing errors: Occasional

AFTER:
├─ Token usage: 17K (-85%)
├─ Wall-clock time: 25s (-83%)
├─ Model: Haiku (10x cheaper)
├─ Output: Structured JSON
├─ Main context growth: +17K
└─ Parsing errors: None (schema enforced)

Cost savings: ~15x
Time savings: ~6x
Accuracy: Improved (no parsing errors)
```

## Summary

The optimization achieves:

✅ **85% token reduction** (110K → 17K)  
✅ **83% time reduction** (2.5min → 25s)  
✅ **10x cost reduction** (sonnet → haiku)  
✅ **Zero parsing errors** (JSON schemas)  
✅ **Minimal orchestrator context** (structured summaries only)  
✅ **Concurrent execution** (parallel where possible)  
✅ **Right-sized models** (haiku by default)  

**Result:** Main agent stays lean, fast, and accurate.
