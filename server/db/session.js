import { Session } from './mongodb.js';

export async function setSessionState(sessionId, state) {
  await Session.updateOne({ _id: sessionId }, { $set: { state } });
}

export async function getSessionState(sessionId) {
  const session = await Session.findById(sessionId).lean();
  return session?.state || null;
}

export async function deleteSessionState(sessionId) {
  await Session.deleteOne({ _id: sessionId });
}
