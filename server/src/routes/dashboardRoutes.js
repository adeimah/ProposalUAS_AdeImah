import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Endpoint: GET /api/savings/dashboard
router.get('/dashboard', authMiddleware, getDashboard);

export default router;
