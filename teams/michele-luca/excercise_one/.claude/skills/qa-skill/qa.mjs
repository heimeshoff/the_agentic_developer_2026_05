#!/usr/bin/env node
// QA gate runner for team michele-luca's budget app (React 19 + Vite + TS).
//
// Purpose: one command that runs every static-quality gate this project has
// and reports a single pass/fail verdict — the check to run before a commit,
// a PR, or a review sign-off. There is no unit-test runner installed yet
// (no `test` script, no vitest), so "QA" here means lint + typecheck + build.
//
// Gates, in order (fail-fast OFF — all run so you see every problem at once):
//   1. lint      eslint .            style + react-hooks + react-refresh rules
//   2. types     tsc -b --force      full TypeScript typecheck across both
//                                     project refs. --force is REQUIRED: plain
//                                     `tsc -b` is incremental and silently
//                                     skips re-checking when nothing changed,
//                                     so it would report a stale green.
//   3. build     vite build          production bundle. vite/esbuild does NOT
//                                     typecheck, so this catches bundling/
//                                     import/asset errors that tsc misses.
//
// Usage (run from the exercise folder teams/michele-luca/excercise_one/):
//   node .claude/skills/qa-budget-app/qa.mjs            # all gates
//   node .claude/skills/qa-budget-app/qa.mjs lint       # one gate
//   node .claude/skills/qa-budget-app/qa.mjs types
//   node .claude/skills/qa-budget-app/qa.mjs build
//   node .claude/skills/qa-budget-app/qa.mjs lint --fix # eslint --fix then report
//
// Exit code: 0 if every selected gate passed, 1 otherwise. Use it in CI / hooks.

import { spawnSync } from 'node:child_process';

const isWin = process.platform === 'win32';
const npx = isWin ? 'npx.cmd' : 'npx';

const argv = process.argv.slice(2);
const fix = argv.includes('--fix');
const selected = argv.filter((a) => !a.startsWith('--'));
const which = selected[0] || 'all';

const GATES = {
  lint: { label: 'lint     (eslint)', cmd: npx, args: ['eslint', '.', ...(fix ? ['--fix'] : [])] },
  types: { label: 'types    (tsc -b --force)', cmd: npx, args: ['tsc', '-b', '--force'] },
  build: { label: 'build    (vite build)', cmd: npx, args: ['vite', 'build'] },
};

const order = which === 'all' ? ['lint', 'types', 'build'] : [which];
for (const g of order) {
  if (!GATES[g]) {
    console.error(`Unknown gate "${g}". Use: all | lint | types | build  [--fix]`);
    process.exit(2);
  }
}

console.log(`\n  QA gates: ${order.join(' → ')}\n`);
const results = [];
for (const g of order) {
  const { label, cmd, args } = GATES[g];
  process.stdout.write(`──▶ ${label}\n`);
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: isWin });
  const ok = r.status === 0;
  results.push({ g, label, ok });
  process.stdout.write(ok ? `    ✓ ${g} passed\n\n` : `    ✗ ${g} FAILED (exit ${r.status})\n\n`);
}

console.log('  ── summary ─────────────────────────');
for (const { label, ok } of results) console.log(`  ${ok ? '✓ PASS' : '✗ FAIL'}  ${label}`);
const failed = results.filter((r) => !r.ok);
console.log('  ────────────────────────────────────');
if (failed.length) {
  console.log(`\n  ✗ ${failed.length}/${results.length} gate(s) failed.\n`);
  process.exit(1);
}
console.log(`\n  ✓ all ${results.length} gate(s) passed.\n`);
