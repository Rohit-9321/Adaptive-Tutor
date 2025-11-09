import React from 'react';
import Card from '../components/Card.jsx';
import QuizQuestion from '../components/QuizQuestion.jsx';
import api from '../utils/api';
import { useQuiz } from '../context/QuizContext.jsx';

export default function Quiz() {
  const {
    state, startQuiz, selectAnswer, submitQuiz, resetQuiz,
    setTopic, setDifficulty, setN, setMessage
  } = useQuiz();

  const { topic, difficulty, n, questions, answers, status, message } = state;

  async function generate() {
    try {
      const res = await api.post('/api/quiz/generate', { topic, difficulty, n });
      startQuiz({ topic, difficulty, n, questions: res.data?.questions || [] });
    } catch {
      setMessage('Failed to generate questions');
    }
  }

  async function explain(idx) {
    try {
      const q = questions[idx];
      const selectedIndex = answers[idx] ?? 0;
      const res = await api.post('/api/quiz/explain', { question: q, selectedIndex });
      const text = res.data?.explanation || '';
      if ('speechSynthesis' in window) {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
      }
      setMessage('Explanation ready.');
    } catch {
      setMessage('Failed to get explanation');
    }
  }

  // --- NEW: normalize what we send to /api/progress/submit ---
  function buildAnswersPayload(questions, answers) {
    return questions.map((q, idx) => ({
      correct: answers[idx] === q.answerIndex,
      timeMs: 0,                    // keep 0 unless you track timing
      picked: answers[idx] ?? null, // optional: what the student chose
      key: idx
    }));
  }

  // --- UPDATED: make submit save to backend so Dashboard updates ---
  async function scoreQuiz() {
    try {
      // 1) compute score
      let correct = 0;
      questions.forEach((q, i) => { if (answers[i] === q.answerIndex) correct++; });
      const score = Math.round((correct / Math.max(1, questions.length)) * 100);

      // 2) adaptive difficulty for next quiz
      const next =
        score >= 80 ? Math.min(5, difficulty + 1)
        : score <= 50 ? Math.max(1, difficulty - 1)
        : difficulty;

      // 3) persist attempt so Dashboard shows it
      await api.post('/api/progress/submit', {
        topic,
        score,
        difficulty,
        answers: buildAnswersPayload(questions, answers)
      });

      // 4) lock quiz but keep it visible for copy/paste to AI Tutor
      setMessage(`You scored ${score}%. Next suggested difficulty: ${next}`);
      setDifficulty(next);
      submitQuiz();

      // Optional: immediately jump to Dashboard to see update
      // import { useNavigate } from 'react-router-dom'; const navigate = useNavigate(); navigate('/');

    } catch (e) {
      console.error('[progress.submit] failed', e);
      setMessage('Could not save your result. Please try Submit again.');
    }
  }

  return (
    <div className="grid gap-6">
      <Card title="Quiz Generator" subtitle="Pick a topic and difficulty, then generate MCQs">
        <div className="grid md:grid-cols-5 gap-3">
          <input
            className="input md:col-span-2"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Topic (e.g., Algebra)"
          />
          <select className="select" value={difficulty} onChange={e => setDifficulty(+e.target.value)}>
            {[1,2,3,4,5].map(v => <option key={v} value={v}>Difficulty {v}</option>)}
          </select>
          <select className="select" value={n} onChange={e => setN(+e.target.value)}>
            {[3,5,10,15,20].map(v => <option key={v} value={v}>{v} Qs</option>)}
          </select>
          <button className="button" onClick={generate}>Generate</button>
        </div>
      </Card>

      {questions.length > 0 && (
        <Card title={`Your Questions ${status === 'submitted' ? '(submitted)' : ''}`}>
          <div className="grid gap-4">
            {questions.map((q, i) => (
              <div key={i} className="grid gap-2">
                <QuizQuestion
                  q={q}
                  index={i}
                  selected={answers[i]}
                  onSelect={(ans) => status === 'in_progress' && selectAnswer(i, ans)}
                />
                <div className="flex gap-2">
                  <button className="button" onClick={() => explain(i)}>Explain (TTS)</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            {status === 'in_progress' && (
              <button className="button" onClick={scoreQuiz}>Submit Quiz</button>
            )}
            <button className="button-secondary" onClick={resetQuiz}>Reset</button>
          </div>

          {message && <div className="mt-2 text-sm text-slate-700">{message}</div>}
        </Card>
      )}
    </div>
  );
}
