Generate JUnit 5 tests for the specified Java class (or the most recently edited Java file if none is given), run them with Maven, and iterate until all tests pass.

## Steps

1. **Identify the target class.**
   - If `$ARGUMENTS` is provided, treat it as the class name or file path to test.
   - Otherwise, find the most recently modified `.java` file under `src/main/` in the current team exercise folder.
   - Read the full source of that class.

2. **Locate or create the test file.**
   - Mirror the source path under `src/test/java/` with a `Test` suffix (e.g. `src/main/java/com/example/Foo.java` → `src/test/java/com/example/FooTest.java`).
   - If the test file already exists, read it before generating so you don't duplicate existing tests.

3. **Generate JUnit 5 tests.**
   - Use `@Test` from `org.junit.jupiter.api.Test`.
   - Cover: happy path, boundary conditions, and edge cases (null inputs, empty collections, negative numbers, etc.).
   - Use `assertThrows` for expected exceptions.
   - Keep tests small and focused — one behaviour per test method.
   - Add the standard Maven Surefire-compatible class structure (public class, no-arg constructor).

4. **Run the tests.**
   Use the full Maven path on Windows:
   ```
   & "C:\Users\Monkey Harris\Maven\apache-maven-3.9.16\bin\mvn.cmd" test -Dtest=<TestClassName> -f <path-to-pom.xml>
   ```
   If `mvn` is on the PATH, use `mvn test -Dtest=<TestClassName> -q` from the exercise root instead.

5. **Analyse failures.**
   - Read the Surefire report or the Maven output to identify each failing test and the root cause.
   - Determine whether the fix belongs in the **test** (wrong assertion, bad test data) or the **production code** (genuine bug).
   - Apply the fix.

6. **Repeat** steps 4–5 until `mvn test` exits 0 with all tests passing.

7. **Report.**
   - List every test method generated.
   - State how many iterations were needed.
   - Summarise any bugs found and fixed in the production code.
