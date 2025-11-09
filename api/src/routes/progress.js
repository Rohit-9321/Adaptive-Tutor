import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { submit, summary } from '../controllers/progressController.js';
const router = Router();
router.post('/submit', requireAuth, submit);
router.get('/summary', requireAuth, summary);
export default router;