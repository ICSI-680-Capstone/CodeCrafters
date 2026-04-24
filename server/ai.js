// ── Shared Gemini helper ──────────────────────────────────────────────────────

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Call the Gemini REST API.
 * @param {string} systemText   - system instruction text
 * @param {string} userText     - user turn text
 * @param {object} opts         - { json: bool, temperature, maxTokens }
 * Returns the raw text of the first candidate, or null on any failure.
 */
async function callGemini(systemText, userText, { json = false, temperature = 0.9, maxTokens = 512 } = {}) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const body = {
    system_instruction: { parts: [{ text: systemText }] },
    contents: [{ role: 'user', parts: [{ text: userText }] }],
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
      ...(json ? { responseMimeType: 'application/json' } : {}),
    },
  };

  try {
    const res = await fetch(`${GEMINI_URL}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn(`[Gemini] HTTP ${res.status}:`, errText.slice(0, 200));
      return null;
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    if (!text) console.warn('[Gemini] Empty response:', JSON.stringify(data).slice(0, 300));
    return text;
  } catch (err) {
    console.warn('[Gemini] fetch error:', err.message);
    return null;
  }
}

// ── AI Chat ───────────────────────────────────────────────────────────────────

const CHAT_FALLBACKS = [
  "Great idea! Let me try that approach too.",
  "I'm working on my part — almost done!",
  "Nice thinking! Python is so fun for this kind of problem.",
  "Good progress! I think we've got this one.",
  "Let me know if you get stuck — we can figure it out together!",
  "Ooh, interesting approach. I'll try something similar.",
  "Almost there! Keep going 💪",
];

export async function generateAIChatResponse(userMessage, stage) {
  const systemText = `You are "AI Buddy", a friendly Python coding partner in a collaborative learning game called CodeCrafters.
You're on stage ${stage}/5 with a student. Keep replies very short (1-2 sentences), upbeat, and focused on the coding challenge.
Never write code blocks — just chat naturally like a teammate.`;

  const text = await callGemini(systemText, userMessage, { temperature: 1.0, maxTokens: 80 });
  if (text) return text.trim();

  // Anthropic fallback
  try {
    if (process.env.ANTHROPIC_API_KEY) {
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 100,
        system: systemText,
        messages: [{ role: 'user', content: userMessage }],
      });
      return response.content[0].text;
    }
  } catch { /* fall through */ }

  return CHAT_FALLBACKS[Math.floor(Math.random() * CHAT_FALLBACKS.length)];
}

// ── Task generation ───────────────────────────────────────────────────────────

import { LEVEL_NAMES } from './constants.js';

// Detailed per-level spec sent verbatim to Gemini so it cannot drift out of scope.
const LEVEL_SPEC = {
  1: {
    name: 'Foundation',
    summary: 'variables, data types, print()',
    allowed: `ALLOWED constructs (Foundation):
- Variable assignment: name = value
- Data types: str, int, float, bool
- print() with string concatenation or a single value
- input() only when the task explicitly needs user input (set expected_output to null in that case)
FORBIDDEN: if/else, loops, functions, lists, imports, f-strings`,
    exampleSolution: `# Architect example (Library · Foundation):
lib_name = "Grand Library"
print(lib_name)
# expected_output: "Grand Library"

# Builder example (Library · Foundation):
book_count = 500
print(book_count)
# expected_output: "500"`,
  },
  2: {
    name: 'Walls',
    summary: 'if/else conditionals, for loops, lists',
    allowed: `ALLOWED constructs (Walls):
- if / elif / else statements
- for loops iterating over a list or range()
- List literals: items = [...]
- print() inside or outside control flow
- len() is allowed
- Variables and data types from Foundation
FORBIDDEN: while loops, functions (def), imports, try/except, nested functions`,
    exampleSolution: `# Architect example (Library · Walls):
books = 150
if books > 100:
    print("Well stocked!")
else:
    print("Need more books")
# expected_output: "Well stocked!"

# Builder example (Library · Walls):
genres = ["Fiction", "Science", "History"]
for g in genres:
    print(g)
# expected_output: "Fiction\\nScience\\nHistory"`,
  },
  3: {
    name: 'Roof',
    summary: 'functions with parameters and return values',
    allowed: `ALLOWED constructs (Roof):
- def function_name(param1, param2, ...): with a return statement
- Calling the function and printing its return value
- Simple arithmetic or string operations inside the function
- if/else and lists inside the function body if needed
- Variables and data types from Foundation
FORBIDDEN: classes, imports, recursion, lambda, global variables modified inside function`,
    exampleSolution: `# Architect example (Library · Roof):
def greet_reader():
    return "Welcome to the Library!"
print(greet_reader())
# expected_output: "Welcome to the Library!"

# Builder example (Library · Roof):
def book_info(title):
    return "Book: " + title
print(book_info("Python 101"))
# expected_output: "Book: Python 101"`,
  },
};

/**
 * Generate a fresh Task for the given context via Gemini.
 * Returns a Task-shaped object, or null if generation fails.
 *
 * Task shape:
 *   { title, description, steps: string[], starterCode, expected_output: string|null }
 */
export async function generateTask({ building, stage, level, role }) {
  const spec = LEVEL_SPEC[level] ?? LEVEL_SPEC[1];

  const roleContext = role === 'Architect'
    ? `The Architect designs and names things (declaring values, naming structures, making boolean decisions).`
    : `The Builder constructs and counts things (processing data, iterating over collections, computing results).`;

  const systemText = `You are a Python question generator for CodeCrafters, a collaborative coding game for school beginners (ages 10–16).
You produce exactly one Python coding task per request.

CRITICAL RULES — violating any of these means the task is wrong:
1. The task MUST use the ${spec.name} level constructs only.
${spec.allowed}
2. The solution must be fully runnable with standard Python 3, zero imports.
3. Theme: every variable name, value, and scenario must relate to the ${building} building on a school campus.
4. Vary the task each call — different variable names, numbers, and scenarios every time.
5. expected_output must be the EXACT stdout string the correct solution prints, using real \\n for multiple lines.
   Only set expected_output to null when the task genuinely requires input().
6. starterCode: 1–3 lines giving a helpful comment or partial scaffold, ending with a newline. No solution code.
7. steps: 2–4 short instructions guiding the student without revealing the answer.
8. Return ONLY a JSON object — no markdown fences, no prose outside the JSON.

Example solutions for reference (do NOT copy these exactly — create a fresh variation):
${spec.exampleSolution}`;

  const userText = `Generate a ${spec.name} level Python task for:
- Building: ${building} (stage ${stage}/5)
- Role: ${role} — ${roleContext}
- Allowed Python: ${spec.summary}

Return JSON with exactly these keys:
{
  "title": "<Building> · ${spec.name} — <Short Task Name>",
  "description": "<one sentence setting the scene>",
  "steps": ["<instruction 1>", "<instruction 2>"],
  "starterCode": "<starter code string>",
  "expected_output": "<exact stdout or null>"
}`;

  const raw = await callGemini(systemText, userText, { json: true, temperature: 1.0, maxTokens: 2048 });
  if (!raw) return null;

  try {
    const task = JSON.parse(raw);

    if (
      typeof task.title !== 'string' ||
      typeof task.description !== 'string' ||
      !Array.isArray(task.steps) ||
      typeof task.starterCode !== 'string'
    ) {
      console.warn('[Gemini] Malformed task:', JSON.stringify(task).slice(0, 300));
      return null;
    }

    return {
      title:           task.title,
      description:     task.description,
      steps:           task.steps,
      starterCode:     task.starterCode,
      expected_output: task.expected_output ?? null,
    };
  } catch (err) {
    console.warn('[Gemini] JSON parse error:', err.message, '| raw:', raw.slice(0, 300));
    return null;
  }
}
