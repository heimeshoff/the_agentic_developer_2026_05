# TASK-003: Build and QA Pipeline

## Metadata
- **Track**: Foundation
- **Priority**: P1 (High - quality gates)
- **Estimate**: 2-3 hours
- **Dependencies**: TASK-001
- **Blocks**: None (enables quality for all tracks)
- **Status**: Blocked by TASK-001

## Objective
Establish automated quality gates: type checking, linting, formatting, and test execution. Configure CI-friendly scripts that can run locally and in GitHub Actions (if desired).

## Acceptance Criteria
- [ ] `npm run typecheck` runs TSC in noEmit mode and passes
- [ ] `npm run lint` runs ESLint and reports no errors
- [ ] `npm run format:check` validates Prettier formatting
- [ ] `npm run test` runs Vitest and all tests pass
- [ ] `npm run qa` runs all checks sequentially (typecheck + lint + format + test)
- [ ] Pre-commit hook runs linting and formatting (optional but recommended)
- [ ] README documents all QA commands
- [ ] Sample CI workflow file (GitHub Actions) included but not activated

## Technical Notes
- Use `tsc --noEmit` for type checking (Vite doesn't type-check by default)
- Configure ESLint to catch common React mistakes (hooks rules, etc.)
- Add `lint-staged` + `husky` for pre-commit checks (optional)
- Keep `npm run qa` fast (< 10s for small project) to encourage frequent use

## Implementation Hints
```json
// package.json scripts
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write src",
    "format:check": "prettier --check src",
    "test": "vitest run",
    "test:watch": "vitest",
    "qa": "npm run typecheck && npm run lint && npm run format:check && npm run test"
  }
}
```

Optional: `.github/workflows/qa.yml` for CI (can activate later).

## Risks & Considerations
- **Low risk**: Standard tooling
- Balance strictness vs. velocity (start lenient, tighten later if time permits)
- Pre-commit hooks can slow down commits; make them optional or fast
- Consider skipping CI for workshop (local QA sufficient)

## Definition of Done
- All QA commands run successfully on clean codebase
- Documentation includes "Quality Assurance" section with command reference
- Optional: pre-commit hook installed and working
- Commit message: "chore: configure type checking, linting, and test pipeline"
