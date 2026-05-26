# TASK-001: Project Scaffold and Development Environment

## Metadata
- **Track**: Foundation
- **Priority**: P0 (Critical - blocks all other work)
- **Estimate**: 2-3 hours
- **Dependencies**: None
- **Blocks**: TASK-002, TASK-003, TASK-004
- **Status**: Ready

## Objective
Set up a modern React 19 + TypeScript + Vite project with necessary tooling, linting, and testing infrastructure. This is the foundation for all subsequent work.

## Acceptance Criteria
- [ ] Vite project created with React 19 + TypeScript template
- [ ] ESLint configured with React/TypeScript rules
- [ ] Prettier configured for code formatting
- [ ] Vitest + React Testing Library installed and configured
- [ ] Basic folder structure created: `src/components/`, `src/domain/`, `src/storage/`, `src/utils/`
- [ ] Dev server runs without errors
- [ ] Sample "Hello World" component renders
- [ ] At least one smoke test passes

## Technical Notes
- Use `npm create vite@latest` with `react-ts` template
- Configure path aliases in `tsconfig.json` and `vite.config.ts` for clean imports
- Add `.editorconfig` for consistent formatting across editors
- Include `tsconfig.json` with strict mode enabled
- Set up `npm run` scripts: `dev`, `build`, `test`, `lint`, `format`

## Implementation Hints
```bash
npm create vite@latest . -- --template react-ts
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D eslint prettier eslint-config-prettier
```

Add to `vite.config.ts`:
```typescript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
}
```

## Risks & Considerations
- **Low risk**: Standard tooling setup
- Ensure React 19 compatibility with all testing libraries (check latest versions)
- Consider Playwright for E2E if time permits (not required for P0)

## Definition of Done
- Project builds successfully (`npm run build`)
- All scripts run without errors
- Documentation updated with "Getting Started" instructions in main README
- Commit message: "feat: initialize React 19 + TypeScript + Vite project scaffold"
