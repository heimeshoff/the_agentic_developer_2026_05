#!/usr/bin/env node
// UserPromptSubmit hook: inject only the project-memory files whose tags match
// the user's prompt. Whatever this prints to stdout is added to Claude's context
// for this turn. Keep it deterministic and cheap — keyword/tag matching, no infra.
//
// Memory files live in ../memory/**.md (excluding README.md) with frontmatter:
//   ---
//   id: mem-...
//   title: ...
//   tags: [income, recurring, money]
//   ---
//   body...

import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const MEM_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "memory");
const MAX_FILES = 4; // never inject more than this many files
const MAX_CHARS = 6000; // hard cap on injected size — protect the context budget

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function getPrompt(raw) {
  try {
    return JSON.parse(raw).prompt ?? "";
  } catch {
    return raw; // fall back to treating stdin as the raw prompt
  }
}

function walk(dir) {
  let out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out = out.concat(walk(p));
    else if (name.endsWith(".md") && name !== "README.md") out.push(p);
  }
  return out;
}

function parse(file) {
  const text = readFileSync(file, "utf8");
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { id: "", title: file, tags: [], body: text.trim() };
  const fm = m[1];
  const body = m[2].trim();
  const tagsRaw = fm.match(/tags:\s*\[([^\]]*)\]/);
  const tags = tagsRaw
    ? tagsRaw[1].split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
    : [];
  const id = (fm.match(/id:\s*(.+)/)?.[1] ?? "").trim().toLowerCase();
  const title = (fm.match(/title:\s*(.+)/)?.[1] ?? id).trim();
  return { id, title, tags, body };
}

const prompt = getPrompt(readStdin());
const hay = prompt.toLowerCase();
if (!hay.trim()) process.exit(0);
const words = new Set(hay.split(/[^a-z0-9]+/).filter(Boolean));

let files;
try {
  files = walk(MEM_DIR);
} catch {
  process.exit(0); // no memory dir yet — stay silent
}

const scored = files
  .map((f) => {
    const meta = parse(f);
    let score = 0;
    for (const t of meta.tags) {
      if (words.has(t) || (t.includes(" ") && hay.includes(t))) score += 2;
    }
    if (meta.id && hay.includes(meta.id)) score += 3;
    return { meta, score };
  })
  .filter((x) => x.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, MAX_FILES);

if (!scored.length) process.exit(0);

let out = "## Relevant project memory (auto-loaded by tag match)\n";
let budget = MAX_CHARS - out.length;
for (const { meta } of scored) {
  const chunk = `\n### ${meta.title}\n${meta.body}\n`;
  if (chunk.length > budget) break;
  out += chunk;
  budget -= chunk.length;
}
process.stdout.write(out);
