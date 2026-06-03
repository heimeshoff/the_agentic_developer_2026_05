import { Agent } from "claude/tools";

export async function run(args: string) {
  // Parse arguments
  const trimmedArgs = args?.trim() || "";

  if (trimmedArgs === "--help") {
    return `
# Plan Tasks Skill

Usage:
  /plan-tasks                          # Uses REQUIREMENTS.md in current directory
  /plan-tasks path/to/requirements.md  # Uses specified file

Launches the task-planner agent to break down requirements into tasks.
See .claude/skills/plan-tasks/SKILL.md for full documentation.
    `.trim();
  }

  // Determine requirements file path
  let requirementsPath = trimmedArgs || "REQUIREMENTS.md";

  // Build prompt for the agent
  const prompt = requirementsPath
    ? `Read the requirements document at "${requirementsPath}" and break it down into tasks in docs/backlog/.

       Follow your standard workflow:
       1. Analyze the requirements
       2. Ask clarifying questions if you find ambiguities
       3. Propose the task structure before generating files
       4. Create individual task files with proper metadata
       5. Generate INDEX.md for overview
       6. Report summary

       If the requirements file doesn't exist, let me know and I'll provide guidance.`
    : `Look for a requirements document (REQUIREMENTS.md, or common locations like docs/requirements.md, specs/, etc.) and break it down into tasks.

       If you can't find requirements, ask me to provide the path or describe what needs to be planned.`;

  // Launch the task-planner agent
  await Agent({
    subagent_type: "task-planner",
    description: "Break down requirements into tasks",
    prompt: prompt
  });
}
