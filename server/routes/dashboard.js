import express from 'express';
const router = express.Router();
import { Session, Player } from '../db/mongodb.js';
import { authMiddleware } from '../middleware/auth.js';

// Must stay in lockstep with STAGES in client/lib/stages.ts
const BUILDINGS = [
  { key: 'library',     stageNumber: 1 },
  { key: 'classroom',   stageNumber: 2 },
  { key: 'cafeteria',   stageNumber: 3 },
  { key: 'science-lab', stageNumber: 4 },
  { key: 'playground',  stageNumber: 5 },
];

const LEVEL_NAMES = { 1: 'Foundation', 2: 'Walls', 3: 'Roof' };

// For a session row, return the number of stages fully completed.
function stagesDone(row) {
  return row.completed ? 5 : Math.max(0, row.stage - 1);
}

// GET /api/dashboard/buildings
// Per-building progress broken down by level (Foundation / Walls / Roof).
// A building is only "Complete" when all three levels are done.
router.get('/buildings', authMiddleware, async (req, res) => {
  const { id: userId } = req.user;

  try {
    const players = await Player.find({ userId }).lean();
    const sessionIds = players.map(p => p.sessionId);
    const sessions = await Session.find(
      { _id: { $in: sessionIds } },
      { _id: 1, stage: 1, level: 1, completed: 1 }
    ).lean();

    const progress = {};
    BUILDINGS.forEach(({ key, stageNumber }) => {
      const completedLevels = new Set();
      let inProgressLevel = null;

      for (const row of sessions) {
        const done = stagesDone(row);
        const lvl = row.level || 1; // default to Foundation for legacy sessions

        if (done >= stageNumber) {
          completedLevels.add(lvl);
        } else if (!row.completed && row.stage === stageNumber) {
          // Currently playing this building at this level — mark as in-progress
          // only if not already completed at this level
          if (!completedLevels.has(lvl)) {
            inProgressLevel = lvl;
          }
        }
      }

      const pct = Math.round((completedLevels.size / 3) * 100);

      let label;
      if (completedLevels.size === 3) {
        label = 'Complete!';
      } else if (completedLevels.size > 0 && inProgressLevel !== null) {
        label = `${completedLevels.size}/3 levels · ${LEVEL_NAMES[inProgressLevel]} in progress`;
      } else if (completedLevels.size > 0) {
        label = `${completedLevels.size}/3 levels done`;
      } else if (inProgressLevel !== null) {
        label = `${LEVEL_NAMES[inProgressLevel]} in progress`;
      } else {
        label = 'Not started';
      }

      progress[key] = {
        pct,
        label,
        completedLevels: [...completedLevels].sort(),
        inProgressLevel,
      };
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

    // Track unique (building, level) completions with Sets to avoid double-counting retries.
    const completedCombos = new Set();   // `${stageNumber}:${level}`
    const startedBuildings = new Set();
    const levelCounts = { 1: new Set(), 2: new Set(), 3: new Set() };

    for (const s of sessions) {
      const done = stagesDone(s);
      const lvl = s.level || 1;

      for (let i = 1; i <= done; i++) {
        completedCombos.add(`${i}:${lvl}`);
        startedBuildings.add(i);
        levelCounts[lvl].add(i);
      }
      // Current in-progress building counts as started
      if (!s.completed && s.stage >= 1 && s.stage <= 5) {
        startedBuildings.add(s.stage);
      }
    }

    // A building is fully complete only when all 3 levels are done for it.
    let buildingsComplete = 0;
    for (let stageNum = 1; stageNum <= 5; stageNum++) {
      const allThree = [1, 2, 3].every(lvl => completedCombos.has(`${stageNum}:${lvl}`));
      if (allThree) buildingsComplete++;
    }

    res.json({
      buildingsStarted: startedBuildings.size,
      questionsSolved: completedCombos.size,
      buildingsComplete,
      pointsEarned: completedCombos.size * 100,
      levelMastery: {
        foundation: levelCounts[1].size,
        walls: levelCounts[2].size,
        roof: levelCounts[3].size,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
