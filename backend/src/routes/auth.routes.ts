import { Router } from 'express';
import { authService } from 'services/auth.service.ts';
import {
   authenticateToken,
   parseOAuth2Form,
} from 'middlewares/auth.middleware.ts';
import authControllers from 'controllers/auth.controllers.ts';

export default () => {
   const router = Router();

   router.post('/register', authControllers.register);
   router.post('/login', authControllers.login);

   router.post(
      '/login/access-token',
      parseOAuth2Form,
      authControllers.accessToken,
   );

   router.post(
      '/login/test-token',
      authenticateToken,
      authControllers.testToken,
   );

   return router;
};
