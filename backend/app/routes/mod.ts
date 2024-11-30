import { Application } from 'express';
import authRouter from 'routes/auth.routes.ts';
import configureProtectedRoutes from 'routes/protected/mod.ts';

export default (app: Application) => {
   console.log('Configuring Routes:');
   app.use('/auth', authRouter());
   configureProtectedRoutes(app);
};

