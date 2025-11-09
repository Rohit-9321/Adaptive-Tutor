import { z } from 'zod';
import Progress from '../models/Progress.js';

const SUB = z.object({
  topic: z.string(),
  score: z.number().min(0).max(100),
  difficulty: z.number().min(1).max(5),
  answers: z.array(z.object({ correct: z.boolean(), timeMs: z.number().min(0) }))
});

export async function submit(req, res) {
  try {
    const payload = SUB.parse(req.body);
    const saved = await Progress.create({ ...payload, userId: req.user.uid });
    res.json({ id: saved._id });
  } catch (e) { res.status(400).json({ error: e.message }); }
}

export async function summary(req, res) {
  const recent = await Progress.find({ userId: req.user.uid }).sort({ createdAt:-1 }).limit(10).lean();
  const avgScore = recent.length ? recent.reduce((a,b)=>a+b.score,0)/recent.length : 0;
  res.json({ recent, avgScore });
}