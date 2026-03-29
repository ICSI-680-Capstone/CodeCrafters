import { getPool } from './postgres.js';

export async function setSessionState(sessionId, state) {
  const pool = getPool();
  await pool.query(
    `UPDATE sessions SET state = $1 WHERE id = $2`,
    [JSON.stringify(state), sessionId]
  );
}

export async function getSessionState(sessionId) {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT state FROM sessions WHERE id = $1`,
    [sessionId]
  );
  return rows[0]?.state || null;
}

export async function deleteSessionState(sessionId) {
  const pool = getPool();
  await pool.query(`DELETE FROM sessions WHERE id = $1`, [sessionId]);
}