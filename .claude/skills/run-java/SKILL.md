---
name: run-java
description: Build and run the team-tom Java Maven app. Use when asked to "run the app", "start the budget tracker", "demo the app", or "run java". Compiles with Maven, then launches the jar.
version: 1.0.0
---

# Run Java Skill

Builds and runs the team-tom Java Maven application.

## Steps

### Step 1 — Locate the project

1. If `$ARGUMENTS` is a path to a `pom.xml` or a directory containing one, use it.
2. Otherwise default to `teams/team-tom/exercise_1/pom.xml`.
3. Confirm the file exists before proceeding.

### Step 2 — Build

Run Maven package (skipping tests for a fast build):

```
& "C:\Users\Monkey Harris\Maven\apache-maven-3.9.16\bin\mvn.cmd" package -DskipTests -f <path-to-pom.xml>
```

- If the build fails, show the compiler errors and stop — do not attempt to run a broken build.
- If the build succeeds, report: "Build OK — `target/budget-tracker.jar` ready."

### Step 3 — Run

Launch the jar from the exercise root directory:

```
java -jar target/budget-tracker.jar
```

Or with an explicit path:

```
java -jar <exercise-root>/target/budget-tracker.jar
```

- If `java` is not on PATH, try `& "$env:JAVA_HOME\bin\java.exe"`.
- Capture and display all stdout/stderr from the running process.

### Step 4 — Report

After the process exits, report:
- Exit code
- Any exception or error printed to stderr
- A one-line summary: success or the first meaningful error line
