import Anthropic from '@anthropic-ai/sdk';

let client = null;
function getClient() {
  if (!client && process.env.ANTHROPIC_API_KEY) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

const FALLBACKS = [
  "Great idea! Let me try that approach too.",
  "I'm working on my part — almost done!",
  "Nice thinking! Python is so fun for this kind of problem.",
  "Good progress! I think we've got this one.",
  "Let me know if you get stuck — we can figure it out together!",
  "Ooh, interesting approach. I'll try something similar.",
  "Almost there! Keep going 💪",
];

export async function generateAIChatResponse(userMessage, stage) {
  const ai = getClient();
  if (!ai) return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];

  try {
    const response = await ai.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      system: `You are "AI Buddy", a friendly Python coding partner in a collaborative learning game called CodeCrafters.
You're on stage ${stage}/5 with a student. Keep replies short (1-2 sentences), upbeat, and focused on the coding challenge.
Never write code blocks — just chat naturally like a teammate.`,
      messages: [{ role: 'user', content: userMessage }],
    });
    return response.content[0].text;
  } catch {
    return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
  }
}
