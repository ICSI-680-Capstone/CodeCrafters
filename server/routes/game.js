import express from 'express';
const router = express.Router();
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../db/postgres.js';
import { setSessionState, getSessionState } from '../db/session.js';
import { authMiddleware } from '../middleware/auth.js';

// Clamp the caller-supplied startStage into [1, 5]. Anything else falls back to 1.
function normalizeStartStage(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 1;
  return Math.min(5, Math.max(1, Math.floor(n)));
}

// Clamp the caller-supplied level into [1, 3]. Anything else falls back to 1.
function normalizeLevel(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 1;
  return Math.min(3, Math.max(1, Math.floor(n)));
}

router.post('/create', authMiddleware, async (req, res) => {
  const { username, id: userId } = req.user;
  const pool = getPool();
  const sessionId = uuidv4().slice(0, 8).toUpperCase();
  const startStage = normalizeStartStage(req.body?.startStage);
  const level = normalizeLevel(req.body?.level);

  try {
    const initialState = {
      sessionId,
      stage: startStage,
      level,
      score: 0,
      players: {
        Architect: { name: username, userId, ready: false },
        Builder: null,
      },
      chat: [],
    };

    await pool.query(
      'INSERT INTO sessions (id, stage, state) VALUES ($1, $2, $3)',
      [sessionId, startStage, JSON.stringify(initialState)]
    );
    await pool.query(
      'INSERT INTO players (session_id, user_id, name, role) VALUES ($1, $2, $3, $4)',
      [sessionId, userId, username, 'Architect']
    );

    res.json({ sessionId, role: 'Architect', stage: startStage, level });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

router.post('/join', authMiddleware, async (req, res) => {
  const { sessionId } = req.body;
  const { username, id: userId } = req.user;
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

  const pool = getPool();

  try {
    const { rows } = await pool.query('SELECT * FROM sessions WHERE id = $1', [sessionId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Session not found' });
    if (rows[0].completed) return res.status(400).json({ error: 'Session already completed' });

    const state = await getSessionState(sessionId);
    if (!state) return res.status(404).json({ error: 'Session state not found' });

    const level = normalizeLevel(state.level);

    // Rejoin as Architect
    if (state.players.Architect?.userId === userId) {
      return res.json({ sessionId, role: 'Architect', stage: state.stage, level, rejoining: true });
    }

    // Rejoin as Builder
    if (state.players.Builder?.userId === userId) {
      return res.json({ sessionId, role: 'Builder', stage: state.stage, level, rejoining: true });
    }

    // New Builder joining
    if (state.players.Builder) {
      return res.status(400).json({ error: 'Session is full' });
    }

    await pool.query(
      'INSERT INTO players (session_id, user_id, name, role) VALUES ($1, $2, $3, $4)',
      [sessionId, userId, username, 'Builder']
    );

    state.players.Builder = { name: username, userId, ready: false };
    await setSessionState(sessionId, state);

    res.json({ sessionId, role: 'Builder', stage: state.stage, level, rejoining: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to join session' });
  }
});

// POST /api/game/create-ai — create a solo session with an AI Builder
router.post('/create-ai', authMiddleware, async (req, res) => {
  const { username, id: userId } = req.user;
  const pool = getPool();
  const sessionId = uuidv4().slice(0, 8).toUpperCase();
  const startStage = normalizeStartStage(req.body?.startStage);
  const level = normalizeLevel(req.body?.level);

  try {
    const initialState = {
      sessionId,
      stage: startStage,
      level,
      score: 0,
      ai_game: true,
      players: {
        Architect: { name: username, userId, ready: false },
        Builder:   { name: 'AI Buddy', userId: null, isAI: true, ready: false },
      },
      chat: [],
    };

    await pool.query(
      'INSERT INTO sessions (id, stage, state) VALUES ($1, $2, $3)',
      [sessionId, startStage, JSON.stringify(initialState)]
    );
    // Only insert the human player — AI has no users row
    await pool.query(
      'INSERT INTO players (session_id, user_id, name, role) VALUES ($1, $2, $3, $4)',
      [sessionId, userId, username, 'Architect']
    );

    res.json({ sessionId, role: 'Architect', stage: startStage, level });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create AI session' });
  }
});

// GET active session for logged in user
router.get('/active', authMiddleware, async (req, res) => {
  const { id: userId } = req.user;
  const pool = getPool();

  try {
    const { rows } = await pool.query(`
      SELECT s.id, s.stage, s.score, p.role
      FROM sessions s
      JOIN players p ON p.session_id = s.id
      WHERE p.user_id = $1 AND s.completed = FALSE
      ORDER BY s.created_at DESC
      LIMIT 1
    `, [userId]);

    if (rows.length === 0) return res.json({ session: null });
    res.json({ session: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch active session' });
  }
});

router.get('/:sessionId', authMiddleware, async (req, res) => {
  const state = await getSessionState(req.params.sessionId);
  if (!state) return res.status(404).json({ error: 'Session not found' });
  res.json(state);
});

export default router;