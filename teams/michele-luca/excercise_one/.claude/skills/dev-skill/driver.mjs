#!/usr/bin/env node
// Driver for team michele-luca's budget app (React 19 + Vite + TS).
//
// Purpose: give an agent a programmatic handle on the RUNNING app so it can
// verify the React/TypeScript code it just wrote — screenshot the page, read
// the rendered DOM / localStorage, and drive UI flows (click/type).
//
// Uses Playwright driving Microsoft Edge (channel: "msedge") — no Chromium
// download needed; Edge ships with Windows. Playwright is already a
// devDependency in package.json.
//
// Two ways to point it at the app:
//   - default: spawns `vite` on an AUTO-PICKED FREE port (starting at 5173),
//     drives it, then kills it. Auto-free-port makes it safe to run several
//     drivers in parallel (e.g. one per git worktree) without clashing.
//   - --url <url>: connects to an ALREADY-running dev server (recommended
//     while iterating — keep `npm run dev` up for hot reload, re-run the
//     driver after each change).
//
// Port control (only matters on the self-spawn path, not with --url):
//   --port <n>   force an exact port (strict; fails if busy)
//   DEV_PORT=<n> same, via env
//   neither      auto-pick the first free port from 5173 up
//
// Usage (run from the exercise folder):
//   node .claude/skills/dev-skill/driver.mjs shot  [--url U] [--port N] [--out F] [--full]
//   node .claude/skills/dev-skill/driver.mjs eval  [--url U] [--port N] "<js expression>"
//   node .claude/skills/dev-skill/driver.mjs click [--url U] [--port N] "<selector>" [--out F]
//   node .claude/skills/dev-skill/driver.mjs freeport [--port START]   # print a free port and exit
//
// Screenshots default to .claude/skills/dev-skill/last-shot.png

import { chromium } from 'playwright';
import { spawn, execSync } from 'node:child_process';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_OUT = join(HERE, 'last-shot.png');
const DEFAULT_PORT = 5173;

// Find the first free TCP port at or above `start`. Lets parallel drivers each
// grab their own port instead of all fighting over a hardcoded 5173.
function findFreePort(start) {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.once('error', (e) => {
      if (e.code === 'EADDRINUSE') resolve(findFreePort(start + 1));
      else reject(e);
    });
    srv.listen(start, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

// Resolve the self-spawn port: explicit --port / DEV_PORT wins (strict),
// otherwise auto-pick a free one starting at DEFAULT_PORT.
async function resolvePort(opts) {
  if (opts.port) return opts.port;
  if (process.env.DEV_PORT) return Number(process.env.DEV_PORT);
  return findFreePort(DEFAULT_PORT);
}

function parseArgs(argv) {
  const cmd = argv[0];
  const opts = { out: DEFAULT_OUT, full: false, url: null, port: null, rest: [] };
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--url') opts.url = argv[++i];
    else if (a === '--out') opts.out = argv[++i];
    else if (a === '--port') opts.port = Number(argv[++i]);
    else if (a === '--full') opts.full = true;
    else opts.rest.push(a);
  }
  return { cmd, opts };
}

// Spawn `vite` on the given port and resolve once it reports "ready".
function startDevServer(port) {
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const child = spawn(
    npmCmd,
    ['run', 'dev', '--', '--port', String(port), '--strictPort'],
    { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], shell: process.platform === 'win32' }
  );
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('dev server did not become ready in 30s')), 30000);
    const onData = (buf) => {
      const s = buf.toString();
      if (/ready in|Local:\s+http/i.test(s)) {
        clearTimeout(timer);
        resolve(child);
      }
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.on('error', reject);
  });
}

// On Windows, npm spawns vite as a grandchild; killing only the npm pid
// orphans vite and leaves port 5173 occupied. Kill the whole tree.
function killTree(pid) {
  if (!pid) return;
  try {
    if (process.platform === 'win32') execSync(`taskkill /F /T /PID ${pid}`, { stdio: 'ignore' });
    else process.kill(pid);
  } catch { /* already gone */ }
}

async function withPage(opts, fn) {
  let server = null;
  let url = opts.url;
  if (!url) {
    const port = await resolvePort(opts);
    url = `http://localhost:${port}/`;
    server = await startDevServer(port);
  }
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(url, { waitUntil: 'networkidle' });
    const result = await fn(page);
    if (errors.length) console.error('PAGE CONSOLE ERRORS:\n' + errors.join('\n'));
    return result;
  } finally {
    await browser.close();
    if (server) killTree(server.pid);
  }
}

async function main() {
  const { cmd, opts } = parseArgs(process.argv.slice(2));

  if (cmd === 'freeport') {
    // Reserve a port for a background `npm run dev` when running in parallel:
    //   PORT=$(node driver.mjs freeport); npm run dev -- --port $PORT --strictPort &
    //   node driver.mjs shot --url http://localhost:$PORT/
    const p = await findFreePort(opts.port || DEFAULT_PORT);
    console.log(p);
  } else if (cmd === 'shot') {
    await withPage(opts, async (page) => {
      await page.screenshot({ path: opts.out, fullPage: opts.full });
      console.log('screenshot ->', opts.out);
      console.log('title:', await page.title());
    });
  } else if (cmd === 'eval') {
    const expr = opts.rest.join(' ');
    if (!expr) throw new Error('eval needs a JS expression argument');
    await withPage(opts, async (page) => {
      const value = await page.evaluate((e) => {
        const r = (0, eval)(e); // runs in the browser page, not node
        return r === undefined ? '(undefined)' : JSON.parse(JSON.stringify(r));
      }, expr);
      console.log(JSON.stringify(value, null, 2));
    });
  } else if (cmd === 'click') {
    const selector = opts.rest[0];
    if (!selector) throw new Error('click needs a selector argument');
    await withPage(opts, async (page) => {
      await page.click(selector);
      await page.waitForTimeout(200);
      await page.screenshot({ path: opts.out });
      console.log('clicked', selector, '-> screenshot', opts.out);
    });
  } else {
    console.error('Unknown command. Use: shot | eval | click | freeport');
    console.error('  node .claude/skills/dev-skill/driver.mjs shot  [--url U] [--port N] [--out F] [--full]');
    console.error('  node .claude/skills/dev-skill/driver.mjs eval  [--url U] [--port N] "<js>"');
    console.error('  node .claude/skills/dev-skill/driver.mjs click [--url U] [--port N] "<selector>" [--out F]');
    console.error('  node .claude/skills/dev-skill/driver.mjs freeport [--port START]');
    process.exit(2);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
