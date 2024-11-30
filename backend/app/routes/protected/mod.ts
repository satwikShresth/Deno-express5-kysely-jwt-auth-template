import { Application } from 'express';
import { authenticateToken } from 'middlewares/auth.middleware.ts';
import usersRouter from './users.routes.ts';
import itemsRouter from './items.routes.ts';

export default (app: Application) => {
   console.log('- /items');
   app.use('/items', authenticateToken, itemsRouter());
   console.log('- /users');
   app.use('/users', authenticateToken, usersRouter());
};
