import { Application } from 'express';
import getAuthRouter from 'routes/auth.routes.ts';
import getProtectedRouter from 'routes/protected/mod.ts';
import { authenticateToken } from 'middlewares/auth.middleware.ts';
import listEndpoints from 'express-list-endpoints';

export default (app: Application) => {
   app.use('/api/v1/', getAuthRouter());
   app.use('/api/v1/', getProtectedRouter());
};
