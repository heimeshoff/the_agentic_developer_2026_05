---
name: implement
description: >
  Implements one backlog work item at a time using TDD driven by acceptance criteria.
  Use this skill whenever the user says "implement next item", "work on WI-001",
  "pick up a backlog item", "implement from backlog", "build next feature", "work on
  the next thing", or any request to take a work item and turn it into working code.
  Also trigger when the user points at a specific WI number and says "build this" or
  "let's do this one".
---

# Implement

Take one work item from `backlog.md` and implement it. The acceptance criteria written
by the capture skill become test cases; the tests drive the implementation.

## Workflow

### Step 1: Pick a work item

Read `backlog.md` and find items with **Status: todo**.

- If the user specified a WI number (e.g., "work on WI-003"), use that one.
- If the user said "next" or didn't specify, list the available items and let them choose.
  Suggest the lowest-numbered unblocked item as the default.
- If an item has **Depends on** referencing another WI that isn't `done`, flag it as blocked
  and suggest a different one.

Once selected, read the full work item and confirm with the user: "I'll implement WI-NNN:
[title]. Here are the acceptance criteria: [list them]. Ready to plan?"

### Step 2: Understand the codebase

Read the existing source files to understand the current architecture:

1. **Domain model** — `src/Rebalancer/Portfolio.cs` (records, enums, validators)
2. **Core logic** — `src/Rebalancer/PortfolioRebalancer.cs`
3. **Test patterns** — `src/Rebalancer.Tests/UnitTest1.cs` (how tests are structured,
   naming conventions, assertion style)
4. **Any other .cs files** in `src/` that may have been added since

Understand the patterns before planning — the new code should fit naturally alongside
what already exists.

### Step 3: Plan the implementation

Map each acceptance criterion (Given/When/Then) to a concrete test case. For each one:
- What's the test method name? (follow existing naming: descriptive, PascalCase)
- What inputs does it need?
- What assertion proves the criterion is met?

Then identify the production code changes:
- New records/types needed?
- Changes to existing classes?
- New methods or classes?

Present the plan to the user as a short summary:

> **Tests to write:**
> 1. `ShouldDoXWhenY` — verifies [criterion 1]
> 2. `ShouldDoAWhenB` — verifies [criterion 2]
>
> **Code changes:**
> - Add `FooBar` record to `Portfolio.cs`
> - Add `ComputeFoo` method to `PortfolioRebalancer.cs`
>
> **Does this look right?**

Wait for the user to approve or adjust before coding.

### Step 4: Implement via sub-agent

Delegate the coding work to a sub-agent using the Agent tool. The sub-agent gets a
self-contained prompt with everything it needs — no assumptions about conversation context.

The sub-agent prompt must include:
- The project path
- Which files to read first (list them)
- The exact test cases to write (names, inputs, expected outputs)
- The production code changes to make
- Build command: `dotnet build Rebalancer.slnx`
- Test command: `dotnet test Rebalancer.slnx`
- Instruction to follow TDD: write the test first, see it fail, then write the code

The sub-agent should:
1. Write the failing test(s)
2. Run `dotnet test` to confirm they fail for the right reason
3. Write the production code
4. Run `dotnet test` to confirm all tests pass (new and existing — no regressions)
5. If tests fail, fix and retry

### Step 5: Review the results

After the sub-agent finishes:

1. Read the changed files to verify the implementation matches the plan
2. Run `dotnet test Rebalancer.slnx` yourself to confirm everything passes
3. Report to the user:
   - What files were created/modified
   - Test results (pass count)
   - Any deviations from the plan

If something went wrong, discuss with the user before trying again.

### Step 6: Update the backlog

Once the user confirms the implementation is good:

- Update the work item's status in `backlog.md` from `todo` to `done`
- Confirm: "WI-NNN marked as done in backlog.md."

## Rules

- **One item per invocation.** Finish one work item completely before starting another.
  If the user wants to continue, they can invoke the skill again.
- **No skipping tests.** Every acceptance criterion must have a corresponding test.
  If a criterion can't be tested (e.g., it's about UX and there's no UI), flag it
  to the user rather than silently skipping it.
- **No regressions.** All pre-existing tests must still pass after the implementation.
  If a change intentionally alters existing behavior, discuss with the user first.
- **Stay within scope.** Only implement what the work item describes. If you notice
  something else that should change, suggest it as a new capture rather than doing it now.
