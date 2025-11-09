import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "adaptive_tutor.quiz.v1";

const initial = {
  status: "idle",          // idle | in_progress | submitted
  topic: "Algebra",
  difficulty: 2,
  n: 5,
  questions: [],
  answers: {},             // { [qIndex]: choiceIndex }
  startedAt: null,
  submittedAt: null,
  message: ""
};

const Ctx = createContext(null);

export function QuizProvider({ children }) {
  const [state, setState] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initial; }
    catch { return initial; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Actions
  function startQuiz({ topic, difficulty, n, questions }) {
    setState({
      status: "in_progress",
      topic, difficulty, n,
      questions,
      answers: {},
      startedAt: Date.now(),
      submittedAt: null,
      message: ""
    });
  }
  function selectAnswer(qIndex, choiceIndex) {
    setState(s => ({ ...s, answers: { ...s.answers, [qIndex]: choiceIndex } }));
  }
  function submitQuiz() {
    setState(s => ({ ...s, status: "submitted", submittedAt: Date.now() }));
  }
  function resetQuiz() {
    setState(initial);
    localStorage.removeItem(STORAGE_KEY);
  }
  const setTopic = (topic) => setState(s => ({ ...s, topic }));
  const setDifficulty = (difficulty) => setState(s => ({ ...s, difficulty }));
  const setN = (n) => setState(s => ({ ...s, n }));
  const setMessage = (message) => setState(s => ({ ...s, message }));

  const value = useMemo(() => ({
    state, startQuiz, selectAnswer, submitQuiz, resetQuiz,
    setTopic, setDifficulty, setN, setMessage
  }), [state]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useQuiz() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useQuiz must be used inside <QuizProvider>");
  return ctx;
}
