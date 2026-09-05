import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

router.post('/login', authRateLimiter, AuthController.login);
router.get('/me', authMiddleware, AuthController.getMe);

export default router;
