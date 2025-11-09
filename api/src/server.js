// Load environment variables
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Routers
import authRouter from './routes/auth.js';
import quizRouter from './routes/quiz.js';
import progressRouter from './routes/progress.js';
import chatRouter from './routes/chat.js';

// Debug log to confirm key detection
console.log('🔑 Loaded OpenAI key:', process.env.OPENAI_API_KEY ? '✅ Found' : '❌ Missing');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ✅ UPDATED HEALTH ROUTE (v2)
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    ts: Date.now(),
    llm: process.env.OPENAI_API_KEY ? 'openai' : 'mock',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    build: 'HEALTH-V2' // marker to confirm you’re on the right server build
  });
});

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/progress', progressRouter);
app.use('/api/chat', chatRouter);

// Server + MongoDB setup
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

async function main() {
  console.log('BOOT: Adaptive Tutor API (HEALTH-V2)');
  if (!MONGO_URI) {
    console.error('❌ Missing MONGO_URI');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');

    app.listen(PORT, () => {
      console.log(`🚀 API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Fatal:', err);
    process.exit(1);
  }
}

main();
