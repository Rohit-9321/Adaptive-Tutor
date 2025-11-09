import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';

const REG = z.object({ email: z.string().email(), name: z.string().min(1), password: z.string().min(6) });
const LOG = z.object({ email: z.string().email(), password: z.string().min(6) });
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

export async function register(req, res) {
  try {
    const { email, name, password } = REG.parse(req.body);
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, name, passwordHash });
    res.json({ id: user._id });
  } catch (e) { res.status(400).json({ error: e.message }); }
}

export async function login(req, res) {
  try {
    const { email, password } = LOG.parse(req.body);
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ uid: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (e) { res.status(400).json({ error: e.message }); }
}