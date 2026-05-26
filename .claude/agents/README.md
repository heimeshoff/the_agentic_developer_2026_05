# Custom Agents

This directory contains specialized agents for the workshop repository.

## Available Agents

### task-planner

**Purpose**: Generic requirements analysis and task breakdown agent.

**What it does**:
- Reads project requirements documents
- Breaks them down into actionable tasks
- Creates structured backlog in `docs/backlog/`
- Identifies dependencies, risks, and ambiguities
- Asks clarifying questions for unclear requirements

**How to use**:

Via the skill (recommended):
```bash
/plan-tasks                          # Auto-finds REQUIREMENTS.md
/plan-tasks path/to/spec.md          # Use specific file
```

Via Agent tool directly:
```
Agent({
  subagent_type: "task-planner",
  description: "Break down requirements",
  prompt: "Read REQUIREMENTS.md and create tasks in docs/backlog/"
})
```

**Output structure**:
```
docs/backlog/
├── INDEX.md           # Overview, summary, critical path
├── TASK-001.md        # Individual task with metadata
├── TASK-002.md
└── ...
```

**Key features**:
- ✅ Project-agnostic (works with any requirements)
- ✅ Interactive (asks questions before generating)
- ✅ Identifies risks and blockers
- ✅ Proposes alternatives for ambiguous requirements
- ✅ Tracks dependencies and suggests parallel work
- ✅ Markdown-only (no integration with Claude tasks)

**When to use**:
- Starting a new project
- Breaking down a large feature
- Converting specs/PRDs to actionable items
- Creating sprint backlogs

**Configuration**:
- Model: `sonnet` (defined in agent frontmatter)
- Template: See `task-planner.md` for task file structure

---

## Creating New Agents

To add a custom agent to this repo:

1. Create `.claude/agents/your-agent-name.md`
2. Add frontmatter:
   ```yaml
   ---
   name: your-agent-name
   description: Short description of what it does
   model: sonnet  # or opus, haiku
   ---
   ```
3. Write detailed instructions for the agent
4. (Optional) Create a skill in `.claude/skills/` to invoke it easily

See `task-planner.md` for a complete example.

## Agent Design Guidelines

Good agents are:
- **Focused**: One clear responsibility
- **Interactive**: Ask questions rather than guess
- **Self-documenting**: Clear instructions and examples
- **Reusable**: Not tied to specific project structure

Avoid:
- ❌ Making agents too broad ("do everything")
- ❌ Hard-coding project-specific paths
- ❌ Silent assumptions (always clarify)
- ❌ Over-engineering (start simple)
