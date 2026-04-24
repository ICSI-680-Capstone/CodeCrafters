// Single source of truth for shared server-side constants.
// Must stay in lockstep with STAGES in client/lib/stages.ts.

export const BUILDINGS = [
  { key: 'library',     name: 'Library',     stageNumber: 1 },
  { key: 'classroom',   name: 'Classroom',   stageNumber: 2 },
  { key: 'cafeteria',   name: 'Cafeteria',   stageNumber: 3 },
  { key: 'science-lab', name: 'Science Lab', stageNumber: 4 },
  { key: 'playground',  name: 'Playground',  stageNumber: 5 },
];

export const LEVEL_NAMES = { 1: 'Foundation', 2: 'Walls', 3: 'Roof' };
