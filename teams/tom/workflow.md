# Agentic Development Workflow

```mermaid
flowchart TD
    A([Feature Request]) --> B

    subgraph PLAN ["① Plan"]
        B["/plan &lt;feature&gt;\nslash command"] --> C["planner agent\nBreaks feature into tasks\nIdentifies files & edge cases"]
    end

    subgraph CODE ["② Code"]
        C --> D["Claude\nImplements tasks\nfrom the plan"]
    end

    subgraph TEST ["③ Test  — automatic"]
        D --> E["unit-test-writer agent\nDetects new / changed code\nWrites & runs unit tests"]
        E --> F{Tests pass?}
        F -->|No| D
        F -->|Yes| G
    end

    subgraph REVIEW ["④ Review"]
        G["/review\nslash command"] --> H["code-reviewer agent\nChecks diff for bugs,\nsecurity, quality"]
        H --> I{Approved?}
        I -->|Changes needed| D
        I -->|Approved| J
    end

    subgraph COMMIT ["⑤ Commit"]
        J["/commit\nslash command"] --> K([Committed to team branch])
    end

    style PLAN   fill:#e8f4fd,stroke:#5b9bd5
    style CODE   fill:#e8f7ee,stroke:#5baa6e
    style TEST   fill:#fff8e8,stroke:#d5a55b
    style REVIEW fill:#f7e8f4,stroke:#a55baa
    style COMMIT fill:#f4f4f4,stroke:#888888
```

## Agents & Skills used

| Name | Type | File | Trigger |
|------|------|------|---------|
| `planner` | Agent | `.claude/agents/planner.md` | `/plan <feature>` command |
| `unit-test-writer` | Agent | `instructions/.claude/agents/unit-test-writer.md` | Proactive — auto after code |
| `code-reviewer` | Agent | `.claude/agents/code-reviewer.md` | `/review` command |
| `git-commit` | Skill (built-in) | — | `/commit` |
