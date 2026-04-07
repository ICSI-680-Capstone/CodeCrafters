import express from 'express';
const router = express.Router();
import { getPool } from '../db/postgres.js';
import { authMiddleware } from '../middleware/auth.js';

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
