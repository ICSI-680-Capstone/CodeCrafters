import dotenv from 'dotenv';
import express, { json } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

import { connectMongo } from './db/mongodb.js';
import authRoutes from './routes/auth.js';
import gameRoutes from './routes/game.js';
import codeRoutes from './routes/code.js';
import dashboardRoutes from './routes/dashboard.js';
import taskRoutes from './routes/task.js';
import registerSocketHandlers from './socket/handlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

// In production set CLIENT_ORIGIN to your Vercel URL, e.g. https://your-app.vercel.app
// In development '*' is used so the local Next.js dev server can connect freely.
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: CLIENT_ORIGIN, methods: ['GET', 'POST'] },
});

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(json());

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/task', taskRoutes);

registerSocketHandlers(io);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectMongo();
    server.listen(PORT, () => {
      console.log(`✅  CodeCrafters server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌  Failed to start server:', err);
    process.exit(1);
  }
}

start();