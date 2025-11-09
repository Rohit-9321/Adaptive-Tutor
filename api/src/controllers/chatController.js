// api/src/controllers/chatController.js
import OpenAI from 'openai';

// Use your env model when set; sensible default for Groq/OpenAI
const MODEL = process.env.OPENAI_MODEL || 'llama-3.3-70b-versatile'; // or 'gpt-4o-mini'

// Normalize the message array into {role, content} pairs that OpenAI-style APIs expect
function normalizeMessages(messages = []) {
  return messages
    .filter(m => m && typeof m.content === 'string')
    .map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content.trim()
    }));
}

export async function chat(req, res) {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // If no key, keep the UI usable
    if (!process.env.OPENAI_API_KEY) {
      const lastUser = [...messages].reverse().find(m => m.role === 'user')?.content || '';
      return res.json({
        reply:
          `**(Mock)**\n\n` +
          `Here’s a short answer in bullet points:\n` +
          `- ${lastUser.slice(0, 140)}\n- Add more details once an API key is configured.`
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || undefined
    });

    // System style: force clean Markdown, real lists, short paragraphs
   const system = {
  role: 'system',
  content: [
    'You are a clear, concise tutor. ALWAYS format with Markdown.',
    'Rules:',
    '1) Put each bullet on its own line using "-"',
    '2) For steps, use "1.", "2.", each on its own line',
    '3) Add a blank line between paragraphs/lists',
    '4) Use short sections with headings like "## Key Points", "## Example"',
    '5) Do NOT use inline separators like "+" or long dashes; use real bullets/lines'
  ].join('\n')
};


    const history = normalizeMessages(messages);
    const resp = await client.chat.completions.create({
      model: MODEL,
      messages: [system, ...history],
      temperature: 0.3,         // calm, factual tone
      // max_tokens: 600,       // uncomment if your provider needs a cap
    });

    const text =
      resp?.choices?.[0]?.message?.content?.trim() ||
      'Sorry, I could not generate a reply.';

    return res.json({ reply: text });
  } catch (err) {
    // Log provider error so you can see the exact cause in the API console
    console.error('[chat] ERROR', {
      status: err?.status,
      message: err?.message,
      data: err?.response?.data
    });

    // Graceful fallback for common cases (auth/quota) so the chat never "breaks"
    if (err?.status === 401 || err?.status === 429) {
      const lastUser =
        [...(req.body?.messages || [])].reverse().find(m => m.role === 'user')?.content || '';
      return res.json({
        reply:
          `**(Fallback mock)**\n\n` +
          `- Could not reach the LLM provider (status ${err.status}).\n` +
          `- Your question: ${lastUser.slice(0, 200)}\n` +
          `- Ask the admin to fix the API key/limits.`
      });
    }

    return res.status(500).json({
      error: 'CHAT_FAILED',
      details: err?.message || 'unknown'
    });
  }
}
