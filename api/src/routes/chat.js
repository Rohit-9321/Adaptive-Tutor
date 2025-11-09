// api/src/routes/chat.js
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { chat } from '../controllers/chatController.js';

const router = Router();

// real LLM-backed chat
router.post('/send', requireAuth, chat);

export default router;
