import { Application, Router } from 'express';
import { authenticateToken } from 'middlewares/auth.middleware.ts';
import usersRouter from './users.routes.ts';
import itemsRouter from './items.routes.ts';

export default () => {
   const router = Router();

   router.use('/items', authenticateToken, itemsRouter());
   router.use('/users', usersRouter());

   return router;
};
