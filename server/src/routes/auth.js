import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.js';
import { registerValidation, loginValidation } from '../validations/auth.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Public Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected Routes
router.get('/profile', authMiddleware, getProfile);
router.get('/me', authMiddleware, getProfile); // Alias path for compatibility

export default router;
