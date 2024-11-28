import { Router } from 'express';
import { AuthRequest } from 'app/types';
import { authenticateToken } from '../auth/auth.middleware.ts';

const router = Router();

router.get('/', authenticateToken, (req: AuthRequest, res) => {
   res.json({
      message: 'You have access to this protected route',
      user: req.user,
   });
});

export const protectedRoutes = router;
