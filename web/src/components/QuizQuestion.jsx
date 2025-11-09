import React from 'react';
export default function QuizQuestion({ q, index, selected, onSelect }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 hover:border-brand-300 transition">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-slate-500">Question {index+1}</div>
          <div className="font-medium text-slate-900">{q.prompt}</div>
        </div>
        <span className="badge">Diff {q.difficulty ?? 2}</span>
      </div>
      <div className="mt-3 grid gap-2">
        {q.choices?.map((c, i) => (
          <button key={i} onClick={() => onSelect(i)} className={`text-left px-3 py-2 rounded-lg border ${selected===i ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'}`}>
            {String.fromCharCode(65+i)}. {c}
          </button>
        ))}
      </div>
    </div>
  );
}