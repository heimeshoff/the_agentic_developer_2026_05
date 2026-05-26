#!/usr/bin/env node
/**
 * task-orchestrator driver
 *
 * Autonomous task-completion agent for team michele-luca's budgeting app.
 * Reads a pending task from docs/backlog/, implements it via dev-skill,
 * then spawns a QA subagent with qa-skill to verify.
 *
 * Usage:
 *   node orchestrator.mjs [taskfile]
 *
 * If taskfile is omitted, picks the first pending task from docs/backlog/.
 */

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths relative to exercise root
const EXERCISE_ROOT = join(__dirname, '../../..');
const BACKLOG_DIR = join(EXERCISE_ROOT, 'docs/backlog');

/**
 * Parse frontmatter from a markdown file
 * Simple YAML frontmatter parser (no external deps)
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const [, fmRaw, body] = match;
  const frontmatter = {};

  for (const line of fmRaw.split('\n')) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      frontmatter[key.trim()] = valueParts.join(':').trim();
    }
  }

  return { frontmatter, body };
}

/**
 * Serialize frontmatter + body back to markdown
 */
function serializeFrontmatter(frontmatter, body) {
  const fmLines = Object.entries(frontmatter).map(([k, v]) => `${k}: ${v}`);
  return `---\n${fmLines.join('\n')}\n---\n${body}`;
}

/**
 * Find pending tasks in backlog
 */
function findPendingTasks() {
  if (!existsSync(BACKLOG_DIR)) {
    console.error(`❌ Backlog directory not found: ${BACKLOG_DIR}`);
    return [];
  }

  const files = readdirSync(BACKLOG_DIR).filter(f => f.endsWith('.md'));
  const pending = [];

  for (const file of files) {
    const path = join(BACKLOG_DIR, file);
    const content = readFileSync(path, 'utf-8');
    const { frontmatter } = parseFrontmatter(content);

    if (frontmatter.status === 'pending' || frontmatter.status === 'todo') {
      pending.push({ file, path, frontmatter });
    }
  }

  return pending;
}

/**
 * Main orchestration logic
 */
async function main() {
  const args = process.argv.slice(2);
  let taskFile = args[0];

  console.log('🤖 Task Orchestrator starting...\n');

  // Step 1: Find the task
  let taskPath, taskContent, taskFrontmatter, taskBody;

  if (taskFile) {
    taskPath = join(BACKLOG_DIR, taskFile);
    if (!existsSync(taskPath)) {
      console.error(`❌ Task file not found: ${taskPath}`);
      process.exit(1);
    }
    taskContent = readFileSync(taskPath, 'utf-8');
    const parsed = parseFrontmatter(taskContent);
    taskFrontmatter = parsed.frontmatter;
    taskBody = parsed.body;
    console.log(`📋 Using specified task: ${taskFile}`);
  } else {
    const pending = findPendingTasks();
    if (pending.length === 0) {
      console.log('✅ No pending tasks found. Backlog is empty!');
      return;
    }

    // Pick first pending task (could add priority sorting here)
    const task = pending[0];
    taskPath = task.path;
    taskFile = task.file;
    taskContent = readFileSync(taskPath, 'utf-8');
    const parsed = parseFrontmatter(taskContent);
    taskFrontmatter = parsed.frontmatter;
    taskBody = parsed.body;
    console.log(`📋 Auto-selected task: ${taskFile}`);
  }

  console.log(`   Title: ${taskFrontmatter.title || '(untitled)'}`);
  console.log(`   Status: ${taskFrontmatter.status || 'unknown'}`);
  console.log(`   Priority: ${taskFrontmatter.priority || 'normal'}\n`);

  // Step 2: Implementation phase (delegate to dev-skill via Claude)
  console.log('🔧 Implementation phase:');
  console.log('   👉 Claude should now use the dev-skill to implement this task.');
  console.log('   👉 Read the task body below and write the code:\n');
  console.log('---');
  console.log(taskBody);
  console.log('---\n');

  // This script is meant to be called by Claude, which will then:
  // 1. Invoke dev-skill to implement the task
  // 2. Spawn a QA subagent with qa-skill to verify
  // 3. Update task status if QA passes

  console.log('⏸️  Orchestrator pausing here.');
  console.log('   Claude: Use dev-skill to implement, then spawn QA agent with qa-skill.');
  console.log('   When QA passes, update this task to status: completed.\n');

  // Output the task path for easy reference
  console.log(`📄 Task file: ${taskPath}`);
  console.log(`📂 Backlog dir: ${BACKLOG_DIR}`);
}

main().catch(err => {
  console.error('❌ Orchestrator error:', err);
  process.exit(1);
});
