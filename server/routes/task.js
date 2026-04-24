import express from 'express';
const router = express.Router();
import { authMiddleware } from '../middleware/auth.js';
import { generateTask } from '../ai.js';
import { BUILDINGS } from '../constants.js';

const VALID_ROLES = ['Architect', 'Builder'];

/**
 * POST /api/task/generate
 * Body: { stage: 1-5, level: 1-3, role: 'Architect'|'Builder' }
 *
 * Returns a Task object on success, or { fallback: true } when Gemini is
 * unavailable so the client falls back to the static question bank.
 */
router.post('/generate', authMiddleware, async (req, res) => {
  const stage = Number(req.body?.stage);
  const level = Number(req.body?.level);
  const role  = req.body?.role;

  if (!Number.isInteger(stage) || stage < 1 || stage > 5) {
    return res.status(400).json({ error: 'stage must be 1–5' });
  }
  if (!Number.isInteger(level) || level < 1 || level > 3) {
    return res.status(400).json({ error: 'level must be 1–3' });
  }
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: 'role must be Architect or Builder' });
  }

  const { name: building } = BUILDINGS[stage - 1];
  const task = await generateTask({ building, stage, level, role });

  if (!task) {
    return res.json({ fallback: true });
  }

  res.json(task);
});

export default router;
