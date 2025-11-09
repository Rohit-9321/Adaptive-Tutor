import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const navigate = useNavigate();
  useEffect(() => { if (!user) { navigate('/login'); return; } api.get('/api/progress/summary').then(r=>setSummary(r.data)).catch(()=>setSummary({recent:[],avgScore:0})); }, [user]);
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card title="Overall Progress" subtitle="Average score across recent attempts">
        <div className="text-3xl font-bold text-slate-900 mb-2">{Math.round(summary?.avgScore || 0)}%</div>
        <ProgressBar value={summary?.avgScore || 0} />
      </Card>
      <Card title="Quick Actions">
        <div className="grid gap-3">
          <Link to="/quiz" className="button">Start a new quiz</Link>
          <Link to="/chat" className="button">Ask the AI Tutor</Link>
        </div>
      </Card>
      <Card title="Tips" subtitle="Get better results">
        <ul className="list-disc pl-5 text-sm text-slate-700">
          <li>Pick a specific topic</li>
          <li>Use the Explain button for feedback</li>
          <li>Increase difficulty as your score improves</li>
        </ul>
      </Card>
      <div className="md:col-span-3">
        <Card title="Recent Attempts">
          {summary?.recent?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="py-2">When</th><th className="py-2">Topic</th><th className="py-2">Score</th><th className="py-2">Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recent.map((r,i)=>(
                    <tr key={i} className="border-t">
                      <td className="py-2">{new Date(r.createdAt).toLocaleString()}</td>
                      <td className="py-2">{r.topic}</td>
                      <td className="py-2">{r.score}%</td>
                      <td className="py-2">{r.difficulty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="text-slate-600">No attempts yet. <Link className="link" to="/quiz">Take your first quiz</Link>.</div>}
        </Card>
      </div>
    </div>
  );
}