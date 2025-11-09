import { z } from 'zod';
import Quiz from '../models/Quiz.js';
import { generateMCQs, explainAnswer } from '../lib/llm.js';

const GEN = z.object({
  topic: z.string().min(2),
  difficulty: z.coerce.number().int().min(1).max(5).default(2),
  n: z.coerce.number().int().min(1).max(20).default(5),
  learningStyle: z.string().optional()
});

const EXPL = z.object({
  question: z.object({
    prompt: z.string(),
    choices: z.array(z.string()).length(4),
    answerIndex: z.coerce.number().int().min(0).max(3),
    difficulty: z.coerce.number().int().min(1).max(5).optional()
  }),
  selectedIndex: z.coerce.number().int().min(0).max(3)
});

export async function generate(req, res) {
  try {
    console.log('[quiz.generate] body:', req.body);
    const { topic, difficulty, n, learningStyle } = GEN.parse(req.body);
    const questions = await generateMCQs({ topic, difficulty, n, learningStyle: learningStyle || 'mixed' });
    const quiz = await Quiz.create({
      userId: req.user.uid,
      topic, questions,
      modelUsed: process.env.OPENAI_API_KEY ? 'openai' : 'mock'
    });
    res.json({ id: quiz._id, questions });
  } catch (e) {
    console.error('[quiz.generate] ERROR:', e?.message, e?.response?.data || '', e?.stack || '');
    res.status(400).json({ error: 'VALIDATION_OR_LLM_ERROR', details: e?.message || 'unknown', provider: e?.response?.data || null });
  }
}

export async function explain(req, res) {
  try {
    const { question, selectedIndex } = EXPL.parse(req.body);
    const text = await explainAnswer({ question, selectedIndex });
    res.json({ explanation: text });
  } catch (e) {
    console.error('[quiz.explain] ERROR:', e?.message, e?.response?.data || '', e?.stack || '');
    res.status(400).json({ error: 'VALIDATION_OR_LLM_ERROR', details: e?.message || 'unknown', provider: e?.response?.data || null });
  }
}
