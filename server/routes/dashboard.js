import express from 'express';
const router = express.Router();
import { getPool } from '../db/postgres.js';
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
// Progress advances only when the stage has been solved:
//   100% complete if the user has ever finished its stage in any session
//   0%   not started otherwise (including while the stage is currently being played)
router.get('/buildings', authMiddleware, async (req, res) => {
  const { id: userId } = req.user;
  const pool = getPool();

  try {
    const { rows } = await pool.query(`
      SELECT s.id, s.stage, s.completed
      FROM sessions s
      JOIN players p ON p.session_id = s.id
      WHERE p.user_id = $1
    `, [userId]);

    const progress = {};
    BUILDINGS.forEach(({ key, stageNumber }) => {
      let pct = 0;
      let label = 'Not started';

      for (const row of rows) {
        // Stages_done = how many stages this session has finished.
        // When `completed` is true, all 5 are done. Otherwise it's stage - 1
        // because `stage` is the *current* (unsolved) stage the session is on.
        const stagesDone = row.completed ? 5 : Math.max(0, row.stage - 1);

        if (stagesDone >= stageNumber) {
          pct = 100;
          label = 'Complete!';
          break; // can't get better than 100%
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
  const pool = getPool();

  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(DISTINCT s.id)::int                                             AS buildings_started,
        COALESCE(SUM(s.score), 0)::int                                        AS points_earned,
        COUNT(DISTINCT CASE WHEN s.completed = TRUE THEN s.id END)::int       AS buildings_complete,
        COALESCE(SUM(
          CASE WHEN s.completed = TRUE THEN 5
               ELSE GREATEST(s.stage - 1, 0)
          END
        ), 0)::int                                                            AS questions_solved
      FROM sessions s
      JOIN players p ON p.session_id = s.id
      WHERE p.user_id = $1
    `, [userId]);

    const row = rows[0];
    res.json({
      buildingsStarted: row.buildings_started,
      questionsSolved:  row.questions_solved,
      buildingsComplete: row.buildings_complete,
      pointsEarned:     row.points_earned,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
