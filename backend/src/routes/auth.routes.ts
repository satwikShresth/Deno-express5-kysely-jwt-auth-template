import { Router } from 'express';
import { Login, Signup } from '../models/auth.model.ts';
import { validateRequest } from 'zod-express-middleware';
import { authenticateToken } from 'middlewares/auth.middleware.ts';
import authControllers from 'controllers/auth.controllers.ts';
import { parseFormData } from 'middlewares/common.middlware.ts';

export default () => {
   const router = Router();

   router.post(
      '/signup',
      validateRequest({ body: Signup }),
      authControllers.signup,
   );

   router.post(
      '/login/access-token',
      parseFormData,
      validateRequest({ body: Login }),
      authControllers.accessToken,
   );

   router.post(
      '/login/test-token',
      authenticateToken,
      authControllers.testToken,
   );

   return router;
};
