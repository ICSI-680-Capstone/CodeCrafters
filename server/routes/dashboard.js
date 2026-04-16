import express from 'express';
const router = express.Router();
import { Session, Player } from '../db/mongodb.js';
import { authMiddleware } from '../middleware/auth.js';

// Buildings list must line up 1:1 with STAGES in client/lib/stages.ts
const BUILDINGS = [
  { key: 'library',     stageNumber: 1 },
  { key: 'classroom',   stageNumber: 2 },
  { key: 'cafeteria',   stageNumber: 3 },
  { key: 'science-lab', stageNumber: 4 },
  { key: 'playground',  stageNumber: 5 },
];

// GET /api/dashboard/buildings — per-building progress across all the user's sessions.
router.get('/buildings', authMiddleware, async (req, res) => {
  const { id: userId } = req.user;

  try {
    const players = await Player.find({ userId }).lean();
    const sessionIds = players.map(p => p.sessionId);
    const sessions = await Session.find(
      { _id: { $in: sessionIds } },
      { _id: 1, stage: 1, completed: 1 }
    ).lean();

    const progress = {};
    BUILDINGS.forEach(({ key, stageNumber }) => {
      let pct = 0;
      let label = 'Not started';

      for (const row of sessions) {
        const stagesDone = row.completed ? 5 : Math.max(0, row.stage - 1);
        if (stagesDone >= stageNumber) {
          pct = 100;
          label = 'Complete!';
          break;
        }
      }

      progress[key] = { pct, label };
    });

    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch building progress' });
  }
});

// GET /api/dashboard/stats
router.get('/stats', authMiddleware, async (req, res) => {
  const { id: userId } = req.user;

  try {
    const players = await Player.find({ userId }).lean();
    const sessionIds = players.map(p => p.sessionId);
    const sessions = await Session.find({ _id: { $in: sessionIds } }).lean();

    const buildingsStarted = new Set(sessions.map(s => s._id)).size;
    const pointsEarned = sessions.reduce((sum, s) => sum + (s.score || 0), 0);
    const buildingsComplete = sessions.filter(s => s.completed).length;
    const questionsSolved = sessions.reduce((sum, s) => {
      return sum + (s.completed ? 5 : Math.max(0, s.stage - 1));
    }, 0);

    res.json({ buildingsStarted, questionsSolved, buildingsComplete, pointsEarned });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
