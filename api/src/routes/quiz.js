import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { generate, explain } from '../controllers/quizController.js';
const router = Router();
router.post('/generate', requireAuth, generate);
router.post('/explain', requireAuth, explain);
export default router;