---
id: t-001
title: Scaffold pnpm workspace + tooling
status: done
type: scaffold
created: 2026-05-26
completed: 2026-05-26
commit:
depends_on: []
files:
  - package.json
  - pnpm-workspace.yaml
  - tsconfig.base.json
  - biome.json
  - .env.example
  - apps/web/**
  - apps/api/**
  - packages/shared/**
tags: [scaffold, foundation]
---

## Why
Nothing is scaffolded yet. Every other task — schemas, persistence, API, UI — needs a
working monorepo with the agreed tooling before it can begin. This is the root all other
tasks depend on.

## What
Stand up the pnpm-workspace monorepo described in CLAUDE.md:
- Workspace root: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json` (strict),
  `biome.json`, `.env.example`.
- `apps/web` — Vite + React + TypeScript skeleton that boots.
- `apps/api` — Fastify + TypeScript skeleton that boots and serves a health route.
- `packages/shared` — empty TypeScript package wired into the workspace, importable by
  web and api.
- Top-level scripts: `dev` (web + api), `typecheck`, `test`, `lint`, `format`, plus
  per-filter `dev` scripts.

Do not add domain code here — just the scaffold.

## Acceptance criteria
- [ ] `pnpm install` completes without error across all three workspaces.
- [ ] `pnpm typecheck` runs clean (strict TS) across the workspace.
- [ ] `pnpm lint` runs clean via Biome.
- [ ] `pnpm --filter web dev` boots the Vite dev server; the app shell renders.
- [ ] `pnpm --filter api dev` boots Fastify and a health route responds 200.
- [ ] `packages/shared` is importable from both `web` and `api` (a trivial exported
      constant resolves at typecheck time).

## Notes
Stack is fixed in CLAUDE.md (TS strict, Node 22, pnpm, Vite/React, Fastify, Biome,
Vitest). Don't introduce a different bundler/test runner. Keep the api health route
trivial — real routes land in t-007.
