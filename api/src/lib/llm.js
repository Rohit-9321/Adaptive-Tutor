import OpenAI from 'openai';

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function extractJson(text) {
  if (!text) throw new Error('Empty LLM response');
  let clean = text.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  const starts = [clean.indexOf('['), clean.indexOf('{')].filter(i => i >= 0);
  const start = starts.length ? Math.min(...starts) : -1;
  const end = Math.max(clean.lastIndexOf(']'), clean.lastIndexOf('}'));
  if (start >= 0 && end > start) clean = clean.slice(start, end + 1);
  return JSON.parse(clean);
}

export async function generateMCQs({ topic, difficulty = 2, n = 5, learningStyle = 'mixed' }) {
  if (!process.env.OPENAI_API_KEY) {
    return Array.from({ length: n }).map((_, i) => ({
      prompt: `[MOCK] ${topic} Q${i + 1} (diff ${difficulty})`,
      choices: ['A','B','C','D'],
      answerIndex: 0,
      explanation: 'Mock explanation',
      difficulty
    }));
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || undefined
  });

  const system =
    'Generate MCQs. Return STRICT JSON only (no markdown). ' +
    'Each item: { "prompt": string, "choices":[string,string,string,string], "answerIndex":0-3, "explanation":string, "difficulty":1-5 }. ' +
    'Respond as a top-level array or as { "items":[...] }.';

  const user = `Topic: ${topic}
Difficulty: ${difficulty}
Count: ${n}
LearningStyle: ${learningStyle}`;

  let content;
  try {
    const resp = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      response_format: { type: 'json_object' }
    });
    content = resp.choices?.[0]?.message?.content || '';
    console.log('[LLM] raw length:', content.length);
  } catch (err) {
    console.error('[LLM REQUEST ERROR]', { status: err?.status, message: err?.message, data: err?.response?.data });
    throw new Error(`LLM_REQUEST_FAILED: ${err?.message || 'unknown'}`);
  }

  const parsed = extractJson(content);
  const items = Array.isArray(parsed) ? parsed : parsed.items;
  if (!Array.isArray(items)) throw new Error('LLM did not return an array');

  return items.slice(0, n).map((q, i) => {
    if (!q || !Array.isArray(q.choices) || q.choices.length !== 4) throw new Error(`Bad item at index ${i}`);
    return {
      prompt: String(q.prompt || '').trim(),
      choices: q.choices.map(String),
      answerIndex: Number.isInteger(q.answerIndex) ? q.answerIndex : 0,
      explanation: String(q.explanation || '').trim(),
      difficulty: q.difficulty ? Number(q.difficulty) : difficulty
    };
  });
}

export async function explainAnswer({ question, selectedIndex }) {
  if (!process.env.OPENAI_API_KEY) {
    return `Mock explanation: You selected ${selectedIndex}. The correct answer is ${question.answerIndex}.`;
  }
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || undefined
  });
  const sys = 'Be a concise tutor. Explain in 2–3 sentences why the selected option is correct/incorrect.';
  const usr = `Question: ${question.prompt}
Choices: ${question.choices.join(' | ')}
Correct index: ${question.answerIndex}
Student selected: ${selectedIndex}`;

  try {
    const resp = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'system', content: sys }, { role: 'user', content: usr }]
    });
    return resp.choices?.[0]?.message?.content?.trim() || 'Explanation unavailable.';
  } catch (err) {
    console.error('[LLM EXPLAIN ERROR]', { status: err?.status, message: err?.message, data: err?.response?.data });
    return 'Explanation unavailable (LLM error).';
  }
}
