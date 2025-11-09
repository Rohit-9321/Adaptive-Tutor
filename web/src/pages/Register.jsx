import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Register() {
  const [name, setName] = useState('Demo User');
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/auth/register', { email, name, password });
      navigate('/login');
    } catch (e) {
      setError(e?.response?.data?.error || 'Registration failed');
    }
  }

  return (
    <div className="max-w-md mx-auto card">
      <h2 className="text-xl font-semibold text-slate-900 mb-2">Create your account</h2>
      <p className="text-sm text-slate-500 mb-4">Takes less than a minute</p>
      {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
      <form className="grid gap-3" onSubmit={submit}>
        <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Name" />
        <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
        <button className="button w-full">Create account</button>
      </form>
      <div className="text-sm text-slate-600 mt-3">
        Already have an account? <Link className="link" to="/login">Login</Link>
      </div>
    </div>
  );
}