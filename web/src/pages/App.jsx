import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Dashboard from './Dashboard.jsx';
import Quiz from './Quiz.jsx';
import Chat from './Chat.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { QuizProvider } from '../context/QuizContext.jsx';

export default function App() {
  return (
    <AuthProvider>
      <QuizProvider>
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-6 grid gap-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
      </QuizProvider>
    </AuthProvider>
  );
}