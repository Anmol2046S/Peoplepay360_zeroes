import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { SystemRole } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

// Only ADMIN can manage users
router.get('/', requireRole([SystemRole.ADMIN]), UserController.getAllUsers);
router.post('/', requireRole([SystemRole.ADMIN]), UserController.createUser);
router.put('/:id', requireRole([SystemRole.ADMIN]), UserController.updateUser);

export default router;
