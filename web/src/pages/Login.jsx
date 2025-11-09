import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      login(res.data.user);
      navigate('/');
    } catch (e) {
      setError(e?.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div className="max-w-md mx-auto card">
      <h2 className="text-xl font-semibold text-slate-900 mb-2">Welcome back</h2>
      <p className="text-sm text-slate-500 mb-4">Sign in to continue</p>
      {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
      <form className="grid gap-3" onSubmit={submit}>
        <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
        <button className="button w-full">Sign in</button>
      </form>
      <div className="text-sm text-slate-600 mt-3">
        No account? <Link className="link" to="/register">Register</Link>
      </div>
    </div>
  );
}