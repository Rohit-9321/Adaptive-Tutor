import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Card from '../components/Card.jsx';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext.jsx';

/* --- Format helpers --- */
// Convert congested text into real Markdown lists/paragraphs
function formatAssistant(s) {
  if (!s) return '';
  let t = s;

  // remove ascii "rule" lines like ====== or -----
  t = t.replace(/^[=\-]{6,}$/gm, '');

  // put headings like **Title:** on their own line with a blank line before
  t = t.replace(/\s*\*\*([^*]+)\*\*:/g, '\n\n**$1**:');

  // turn inline " + " / " * " separators into list items
  t = t.replace(/\s+\+\s+/g, '\n- ');
  t = t.replace(/\s+\*\s+/g, '\n- ');

  // ensure numbered items start on new lines
  t = t.replace(/(?:^|\s)(\d+)\.\s/g, '\n$1. ');

  // split very long single paragraphs into sentences
  if (!/\n/.test(t) && t.length > 160) t = t.replace(/\. (?=[A-Z(])/g, '.\n');

  t = t.replace(/\n{3,}/g, '\n\n'); // collapse extra blank lines
  return t.trim();
}

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! Ask me anything about your topic.' }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text) return;
    const history = [...messages, { role: 'user', content: text }];
    setMessages(history);
    setInput('');

    try {
      const payload = { messages: history.map(m => ({ role: m.role, content: m.content })) };
      const res = await api.post('/api/chat/send', payload);
      const reply = res.data?.reply || '(no reply)';
      setMessages(m => [...m, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: '(Error: could not get reply)' }]);
    }
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div className="grid gap-6">
      <Card title="AI Tutor Chat" subtitle="Real-time tutoring powered by your LLM provider.">
        {/* Messages */}
        <div className="h-[520px] overflow-y-auto p-4 bg-white rounded-2xl border space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex transition-all duration-200 ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[820px] leading-relaxed px-5 py-3
                  ${
                    m.role === 'user'
                      ? 'bg-gray-100 text-slate-900 border border-slate-200 shadow-sm rounded-2xl rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-2xl rounded-bl-none'
                  }`}
              >
                <div
                  className="prose prose-slate prose-lg max-w-none
                              prose-p:my-2 prose-ul:my-2 prose-ol:my-2
                              prose-li:my-0 prose-pre:my-3 prose-pre:whitespace-pre-wrap
                              prose-headings:mt-2 prose-headings:mb-1"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.role === 'assistant' ? formatAssistant(m.content) : m.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="mt-4 flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Type your question… (Shift+Enter for new line)"
            className="flex-1 h-16 resize-none rounded-xl border px-4 py-3 leading-relaxed
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={send}
            className="h-16 px-6 rounded-xl bg-indigo-600 text-white font-medium shadow-md
                       hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Send
          </button>
        </div>
      </Card>
    </div>
  );
}
