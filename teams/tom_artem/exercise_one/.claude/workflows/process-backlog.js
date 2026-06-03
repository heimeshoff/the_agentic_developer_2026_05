export const meta = {
  name: 'process-backlog',
  description: 'Fetch all pending [Feature] Asana tasks and implement them — Asana ops in parallel, builds sequential to avoid App.jsx conflicts',
  phases: [
    { title: 'Fetch', detail: 'Retrieve all incomplete [Feature] tasks from Asana' },
    { title: 'Prepare', detail: 'Parse descriptions and post in-progress comments in parallel' },
    { title: 'Build', detail: 'Implement each feature sequentially via feature-builder' },
    { title: 'Report', detail: 'Summarise all outcomes' },
  ],
}

const TASKS_SCHEMA = {
  type: 'object',
  properties: {
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          gid: { type: 'string' },
          name: { type: 'string' },
          notes: { type: 'string' },
          permalink_url: { type: 'string' },
        },
        required: ['gid', 'name', 'notes'],
      },
    },
  },
  required: ['tasks'],
}

const PREP_SCHEMA = {
  type: 'object',
  properties: {
    gid: { type: 'string' },
    name: { type: 'string' },
    permalink_url: { type: 'string' },
    summary: { type: 'string' },
    error: { type: 'string' },
  },
  required: ['gid', 'name'],
}

const BUILD_SCHEMA = {
  type: 'object',
  properties: {
    outcome: { type: 'string', enum: ['success', 'failure'] },
    build: { type: 'string', enum: ['pass', 'fail'] },
    tests: { type: 'string', enum: ['pass', 'fail', 'skipped'] },
    summary: { type: 'string' },
    completionReport: { type: 'string' },
  },
  required: ['outcome', 'build', 'tests', 'summary', 'completionReport'],
}

// ── Phase 1: Fetch all pending [Feature] tasks ──────────────────────────────

phase('Fetch')
const { tasks } = await agent(
  `Fetch all incomplete [Feature] Asana tasks for the Personal Finance App.

  Steps:
  1. Call asana_list_workspaces to get the workspace GID.
  2. Call asana_search_tasks with text "[Feature]" scoped to the workspace, filtering for incomplete tasks only.
  3. Return every task with its gid, name, notes, and permalink_url.

  If the project has no pending tasks, return { tasks: [] }.`,
  { schema: TASKS_SCHEMA, label: 'fetch-backlog', phase: 'Fetch' }
)

if (!tasks || tasks.length === 0) {
  log('Backlog is empty — no pending [Feature] tasks found.')
  return { processed: 0, succeeded: 0, failed: 0, skipped: 0 }
}

log(`Found ${tasks.length} pending task(s). Preparing in parallel…`)

// ── Phase 2: Parse descriptions + post in-progress comments (parallel) ───────

phase('Prepare')
const prepared = await parallel(
  tasks.map((task) => () =>
    agent(
      `You are a task-prep agent. Do exactly these two steps for Asana task GID ${task.gid}.

      Task name: ${task.name}
      Task notes:
      ${task.notes || '(empty)'}

      Step A — Parse the decision summary from the notes.
      The notes follow this structure:
        ## Problem
        ## Approach
        ## First Step
        ## Open Questions
        ## Context

      Reconstruct a decision summary in this format:
        Feature: <task name with [Feature] prefix stripped>
        Problem it solves: <## Problem content>
        Chosen approach: <## Approach content>
        Key open questions: <## Open Questions content>
        Suggested first step: <## First Step content>

      If ## Problem, ## Approach, or ## First Step are missing, set summary to null and set error
      to a plain-English description of what is missing.

      Step B — Call asana_create_task_story on GID ${task.gid} with this body:
        🔧 process-backlog picked up this task. Starting implementation via feature-builder.

      Return a JSON object with fields: gid, name, permalink_url, summary (string or null), error (string or null).`,
      {
        schema: PREP_SCHEMA,
        label: `prep:${task.name.replace('[Feature] ', '').slice(0, 30)}`,
        phase: 'Prepare',
      }
    )
  )
)

const valid = prepared.filter(Boolean).filter((t) => t.summary && !t.error)
const skipped = prepared.filter(Boolean).filter((t) => !t.summary || t.error)

if (skipped.length > 0) {
  log(
    `Skipping ${skipped.length} task(s) with invalid descriptions:\n` +
      skipped.map((t) => `  • ${t.name}: ${t.error}`).join('\n')
  )
}

if (valid.length === 0) {
  return {
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: skipped.length,
    skippedTasks: skipped.map((t) => t.name),
  }
}

log(`${valid.length} task(s) ready to build. Starting sequential builds…`)

// ── Phase 3: Build each feature sequentially (avoids App.jsx conflicts) ──────

phase('Build')
const buildResults = []

for (const task of valid) {
  const result = await agent(
    `You are the feature-builder agent. Implement the following feature for the personal finance app.

    TASK: ${task.name}
    ASANA GID: ${task.gid}

    DECISION SUMMARY:
    ${task.summary}

    Follow the full feature-builder workflow:
    1. Parse the brief (feature name, problem, approach, open questions, first step).
    2. Read ALL relevant source files in one parallel batch — do not read them one-by-one.
       At minimum read src/App.jsx and any file the feature will extend, all at once.
    3. For any feature involving financial calculations, also spawn a finance-expert validation
       in parallel with drafting your implementation checklist.
    4. Draft the implementation checklist.
    5. Implement step by step.
    6. Run: cd teams/tom_artem/exercise_one && npm run build
    7. If build passes, invoke the /test skill.
    8. Return a structured completion report.

    Working directory root: teams/tom_artem/exercise_one/
    Stack: React 18, Vite, plain CSS, JavaScript (no TypeScript)`,
    {
      schema: BUILD_SCHEMA,
      label: `build:${task.name.replace('[Feature] ', '').slice(0, 30)}`,
      phase: 'Build',
    }
  )

  if (!result) {
    buildResults.push({ task, outcome: 'failure', build: 'fail', tests: 'skipped', summary: 'Agent returned no result.' })
    continue
  }

  // Update Asana with the outcome
  const comment = result.outcome === 'success'
    ? `✅ Implementation complete.\n\n${result.completionReport}`
    : `❌ Implementation failed.\n\n${result.completionReport}\n\nAction required: review and re-queue or fix the task description.`

  await agent(
    `Update Asana task GID ${task.gid}:
    1. Call asana_create_task_story with this body (verbatim):
       ${comment}
    ${result.outcome === 'success'
      ? '2. Call asana_update_task with completed=true to mark the task done.'
      : '2. Leave the task incomplete so it remains in the backlog.'}
    Return a one-word confirmation: "done".`,
    { label: `asana-update:${task.gid}`, phase: 'Build' }
  )

  buildResults.push({ task, ...result })
  log(`${result.outcome === 'success' ? '✅' : '❌'} ${task.name} — build: ${result.build}, tests: ${result.tests}`)
}

// ── Phase 4: Final report ────────────────────────────────────────────────────

phase('Report')
const succeeded = buildResults.filter((r) => r.outcome === 'success')
const failed = buildResults.filter((r) => r.outcome === 'failure')

const line = '─'.repeat(60)

const successLines = succeeded
  .map((r) => `  ✅ ${r.task.name}\n     Build: ${r.build} | Tests: ${r.tests}\n     ${r.summary}`)
  .join('\n')

const failureLines = failed
  .map((r) => `  ❌ ${r.task.name} (${r.task.permalink_url})\n     ${r.summary}`)
  .join('\n')

const skippedLines = skipped
  .map((t) => `  ⚠️  ${t.name}: ${t.error}`)
  .join('\n')

return [
  line,
  'process-backlog complete',
  line,
  `Tasks found:   ${tasks.length}`,
  `Built:         ${succeeded.length}`,
  `Failed:        ${failed.length}`,
  `Skipped:       ${skipped.length}`,
  '',
  succeeded.length > 0 ? `Built successfully:\n${successLines}` : null,
  failed.length > 0 ? `\nFailed (left in backlog):\n${failureLines}` : null,
  skipped.length > 0 ? `\nSkipped (bad description):\n${skippedLines}` : null,
  line,
]
  .filter((l) => l !== null)
  .join('\n')
