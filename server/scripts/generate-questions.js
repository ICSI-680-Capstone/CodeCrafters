/**
 * generate-questions.js
 *
 * Offline script that uses Claude to generate 3 Python coding tasks per
 * building × level × role combination and writes the result to
 * server/scripts/generated_questions.json for team review.
 *
 * Usage:
 *   cd server
 *   ANTHROPIC_API_KEY=your_key node scripts/generate-questions.js
 */

import Anthropic from '@anthropic-ai/sdk';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BUILDINGS = [
  { id: 'library',     name: 'Library',     emoji: '📚' },
  { id: 'classroom',   name: 'Classroom',   emoji: '🪑' },
  { id: 'cafeteria',   name: 'Cafeteria',   emoji: '🍽️' },
  { id: 'science-lab', name: 'Science Lab', emoji: '🧪' },
  { id: 'playground',  name: 'Playground',  emoji: '🏃' },
];

const LEVELS = {
  1: { name: 'Foundation', concept: 'variables, data types, print(), input()' },
  2: { name: 'Walls',      concept: 'conditionals, loops, lists' },
  3: { name: 'Roof',       concept: 'functions with parameters and return values' },
};

const ROLES = {
  Architect: 'naming, designing, planning, and labelling aspects of the building',
  Builder:   'counting, tracking, constructing, and measuring aspects of the building',
};

async function generateTasks(building, level, role) {
  const levelInfo = LEVELS[level];
  const roleDesc = ROLES[role];

  const prompt = `You are generating Python coding tasks for a collaborative learning game called CodeCrafters where two students build campus buildings together using Python.

Generate exactly 3 Python coding tasks for a ${role} player at Level ${level} (${levelInfo.name}) building a ${building.name}.

Context:
- Level ${level} concept: ${levelInfo.concept}
- ${role} angle: tasks should focus on ${roleDesc}
- Building theme: ${building.name} ${building.emoji}
- The existing task for this combination uses a single variable/print, loop/conditional, or function — generate DIFFERENT tasks with different variable names, values, and scenarios

Rules:
- Each task must teach ONLY the Level ${level} concept (${levelInfo.concept})
- Tasks must be simple enough for beginners
- expected_output must be the EXACT string Python would print — test it mentally before writing
- For input() tasks set expected_output to null
- Level 3 tasks MUST define and call a function
- No imports, no complex logic beyond the level concept
- Variable names and values must differ from each other across the 3 tasks

Return ONLY a valid JSON array of exactly 3 objects. Each object must have these exact keys:
{
  "title": "${building.name} · ${levelInfo.name} — [Short descriptive name]",
  "description": "One sentence describing what needs to be done.",
  "steps": ["Step 1 instruction", "Step 2 instruction"],
  "starterCode": "# Helpful comment\\n\\n",
  "expected_output": "exact output string or null"
}

Return only the JSON array, no explanation, no markdown.`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  return JSON.parse(text);
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌  Set ANTHROPIC_API_KEY before running this script.');
    process.exit(1);
  }

  const result = {};
  const total = BUILDINGS.length * Object.keys(LEVELS).length * Object.keys(ROLES).length;
  let done = 0;

  for (const building of BUILDINGS) {
    result[building.id] = {};
    for (const level of Object.keys(LEVELS)) {
      result[building.id][level] = {};
      for (const role of Object.keys(ROLES)) {
        console.log(`[${++done}/${total}] Generating: ${building.name} · Level ${level} · ${role}...`);
        try {
          const tasks = await generateTasks(building, Number(level), role);
          result[building.id][level][role] = tasks;
          console.log(`  ✅  Got ${tasks.length} tasks`);
        } catch (err) {
          console.error(`  ❌  Failed: ${err.message}`);
          result[building.id][level][role] = [];
        }

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }

  const outputPath = join(__dirname, 'generated_questions.json');
  writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`\n✅  Done! Questions saved to server/scripts/generated_questions.json`);
  console.log(`    Review the file, then we'll add them to client/lib/stages.ts`);
}

main();
