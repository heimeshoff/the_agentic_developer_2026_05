---
id: mem-coding-conventions
title: Convention — code shape, tests, layering
tags: [conventions, typescript, strict, tests, vitest, biome, layering, comments, shared, service]
scope: convention
---
- **Strict TypeScript.** Avoid `any`; prefer `unknown` + a Zod parse at the boundary.
- **Small, domain-named functions** (`createBudget`, not `handlePost`).
- **Layering**: domain/business logic lives in `api` services — not in route handlers and
  not in the UI. Routes validate + delegate; the UI renders.
- **`packages/shared` is the contract.** Domain types, Zod schemas, and money helpers live
  there, imported by both `web` and `api`. Never redefine a type that already exists in shared.
- **Tests** colocated (`*.test.ts`), run with Vitest. Cover money math and budget
  calculations especially — that's where correctness bugs hide.
- **Comments** explain *why* (non-obvious constraints) only — never narrate *what* the code does.
- **No premature abstraction.** Three similar lines beat a wrong abstraction. Don't add config
  flags or error handling for cases that can't happen.
- **Lint/format = Biome.** `pnpm lint` / `pnpm format`.
