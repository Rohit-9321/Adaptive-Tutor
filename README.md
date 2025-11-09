# Adaptive Tutor — MERN + LLM (Full Project)

**High-level, production-ready structure** with attractive Tailwind UI.
- **Backend (Express + MongoDB + JWT)**: Auth, Quiz generation via LLM, Explanations, Chat stub, Progress summary.
- **Frontend (Vite + React + Tailwind)**: Dashboard, Quiz with Explain (TTS), AI Chat, Auth, clean components.

## Local setup

### 1) API
```bash
cd api
cp .env.example .env              # set MONGO_URI, JWT_SECRET; OPENAI_API_KEY optional
npm install
npm run dev                       # http://localhost:4000
```

### 2) Web
```bash
cd web
cp .env.example .env              # VITE_API_URL=http://localhost:4000
npm install
npm run dev                       # http://localhost:5173
```

## Deploy (no Docker)
- **MongoDB Atlas** → get `MONGO_URI`
- **API on Render** → Build `npm install`, Start `node src/server.js`
  - Env: `MONGO_URI`, `JWT_SECRET`, `OPENAI_API_KEY` (optional), `PORT=4000`
- **Web on Vercel** → Env `VITE_API_URL` = your Render API URL, Build `npm run build`, Output `dist`

**Created:** 2025-11-07