---
skill: plan-tasks
description: Break down project requirements into a structured task backlog
args: "[path-to-requirements]"
---

# Plan Tasks Skill

Invokes the **task-planner agent** to analyze requirements and generate a task backlog in `docs/backlog/`.

## Usage

```bash
/plan-tasks                          # Uses REQUIREMENTS.md in current directory
/plan-tasks path/to/requirements.md  # Uses specified file
/plan-tasks --help                   # Show this help
```

## What it does

1. Reads the requirements document
2. Analyzes and identifies ambiguities (asks clarifying questions)
3. Proposes a task structure
4. Generates individual task files in `docs/backlog/TASK-XXX.md`
5. Creates an index file `docs/backlog/INDEX.md`
6. Reports summary and next steps

## Output structure

```
docs/backlog/
├── INDEX.md           # Overview and task list
├── TASK-001.md        # Individual task files
├── TASK-002.md
└── ...
```

Each task file includes:
- ID, title, status, priority, estimate
- Description with context
- Acceptance criteria
- Technical notes
- Dependencies and risks
- Questions/ambiguities flagged

## Examples

**Simple case:**
```
User: /plan-tasks
Agent: Found REQUIREMENTS.md. Creating 15 tasks in docs/backlog/...
```

**With ambiguities:**
```
User: /plan-tasks docs/api-spec.md
Agent: I found some ambiguities:
       1. Authentication method not specified...
       2. Database choice unclear...
       
       [asks questions, then proceeds]
```

**Update existing backlog:**
```
User: /plan-tasks --update
Agent: Found existing backlog with 15 tasks. 
       Reading updated REQUIREMENTS.md...
       [generates new tasks, preserves completed ones]
```

## When to use

- Starting a new project with written requirements
- Breaking down a large feature into tasks
- Converting a spec/PRD into actionable work items
- Creating a backlog for a sprint/milestone

## Implementation

This skill launches the `task-planner` agent which:
- Is project-agnostic (works with any requirements format)
- Only creates markdown files (no integration with Claude's task system)
- Interactive: asks questions before generating tasks
- Flags risks, ambiguities, and missing information

---

**Note**: This is a planning tool, not a project manager. It creates a static backlog. You still need to:
- Review and adjust the generated tasks
- Update task status manually as work progresses
- Refine estimates based on actual work

For active task tracking during implementation, use `/tasks` or Claude's TaskCreate.
