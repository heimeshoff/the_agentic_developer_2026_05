---
name: tdd-java
description: Drive new Java feature development using red-green-refactor TDD. Use when asked to "add a feature TDD", "write the test first", "do TDD for X", or "red-green-refactor X". Takes a feature description and iterates: failing test → minimal implementation → refactor.
version: 1.0.0
---

# TDD Java Skill

Implements a new feature for the team-tom Java project using strict red-green-refactor TDD. Never writes production code before a failing test exists.

## Input

`$ARGUMENTS` is a plain-English feature description, e.g.:
- `BudgetAccount should enforce a monthly spending limit`
- `Transaction should support a TRANSFER type`
- `BudgetTracker should return total spending grouped by category`

If `$ARGUMENTS` is empty, ask the user for a feature description before proceeding.

## Maven command

```
& "C:\Users\Monkey Harris\Maven\apache-maven-3.9.16\bin\mvn.cmd" test -Dtest=<TestClassName> -f <path-to-pom.xml>
```

Use the exercise root pom at `teams/team-tom/exercise_1/pom.xml` unless a different path is given.

---

## RED — Write a failing test

1. **Identify the target class.**
   - Parse `$ARGUMENTS` to determine which existing class the feature belongs to, or whether a new class is needed.
   - Read the relevant source file(s) under `teams/team-tom/exercise_1/src/main/java/com/teamtom/`.

2. **Locate or create the test file.**
   - Mirror the source path under `src/test/java/` with a `Test` suffix.
   - If the test file already exists, read it to understand existing coverage and avoid duplicates.

3. **Write exactly one new test method** that:
   - Describes the desired behaviour from `$ARGUMENTS` in its name (e.g. `shouldRejectTransactionExceedingMonthlyLimit`).
   - Uses `@Test` from `org.junit.jupiter.api.Test`.
   - Uses `assertThrows` for expected exceptions, `assertEquals` / `assertTrue` for state assertions.
   - Will **fail** against the current production code — this is the point.
   - Is small and focused: one behaviour, one test.

4. **Run the test and confirm it fails (RED).**
   - If the test passes immediately, the behaviour already exists. Report this and stop — do not invent busywork.
   - If it fails to compile rather than failing at runtime, that is still RED and is acceptable — proceed.
   - Show the failure output.

---

## GREEN — Write the minimal implementation

5. **Implement just enough production code to make the test pass.**
   - Do not add features beyond what the single test requires.
   - Do not refactor yet — ugly-but-correct is fine at this stage.

6. **Run the failing test again and confirm it passes (GREEN).**
   - Also run the full test suite to check for regressions:
     ```
     & "C:\Users\Monkey Harris\Maven\apache-maven-3.9.16\bin\mvn.cmd" test -f <path-to-pom.xml>
     ```
   - If any previously-passing test now fails, fix the regression before proceeding.
   - Show the passing output.

---

## REFACTOR — Improve without changing behaviour

7. **Review the production code change for:**
   - Duplication (extract a method or constant if the same expression appears twice or more).
   - Naming (rename variables or methods that no longer reflect their purpose).
   - Clarity (simplify a condition, break up a long method).
   - Do **not** change test code during refactor — tests are the safety net.

8. **Apply refactoring changes** (may be zero changes if the code is already clean).

9. **Run the full test suite one final time** to confirm nothing broke.

---

## Report

Summarise the completed cycle:

```
Feature: <description from $ARGUMENTS>

RED   — <test method name> in <TestFile.java> — failed as expected
GREEN — <what was added/changed in production code> — all tests pass
REFACTOR — <what was improved, or "no changes needed">

Tests now passing: <n> / <n>
```

---

## Rules

- **Never write production code before a red test exists.** If you catch yourself doing this, stop and write the test first.
- **One test per cycle.** If the feature needs multiple behaviours, complete one full red-green-refactor cycle, then start the next.
- **Minimal green.** If a `return 42;` makes the test pass, that is the correct green implementation — the next test will force you to generalise.
- **Tests are permanent.** Do not delete or weaken existing tests to make green easier.
