import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Apply authMiddleware to all profile routes
router.use(authMiddleware);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
