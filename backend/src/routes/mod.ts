import { Router } from 'express';
import authRoutes from 'routes/auth.routes.ts';
import usersRoutes from 'routes/users.routes.ts';
import itemsRoutes from 'routes/items.routes.ts';
import { authenticateToken } from 'middlewares/auth.middleware.ts';

export default () => {
   const router = Router();

   router.use(authRoutes());
   router.use(authenticateToken);
   router.use('/items', itemsRoutes());
   router.use('/users', usersRoutes());

   return router;
};
