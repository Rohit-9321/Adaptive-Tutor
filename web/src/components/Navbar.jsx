import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const NavLink = ({ to, children }) => (
    <Link to={to} className={`px-3 py-2 rounded-xl ${pathname===to ? 'bg-brand-100 text-brand-700' : 'text-slate-700 hover:bg-slate-100'}`}>{children}</Link>
  );
  return (
    <header className="bg-white shadow-soft">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-brand-600 grid place-content-center text-white font-bold">AT</div>
          <div className="font-semibold text-slate-900">Adaptive Tutor</div>
        </Link>
        <nav className="flex items-center gap-2">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/quiz">Quiz</NavLink>
          <NavLink to="/chat">AI Tutor</NavLink>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-slate-600">Hi, {user.name}</span>
              <button className="button" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="link">Login</Link>
              <Link to="/register" className="button">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}