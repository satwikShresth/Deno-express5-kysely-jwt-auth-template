import { Request, Response, Router } from 'express';
import { authService } from 'services/auth.service.ts';
import {
   authenticateToken,
   parseOAuth2Form,
} from 'middlewares/auth.middleware.ts';

const controllers = {
   register: async (
      req: Request,
      res: Response,
   ): Promise<Response> => {
      const { email, password } = req.body;

      if (!email || !password) {
         return res.status(400).json({
            message: 'Username and password are required',
         });
      }

      await authService.registerUser(email, password);
      return res.status(201).json({
         message: 'User registered successfully',
      });
   },

   // OAuth2 compatible token login
   accessToken: async (
      req: Request,
      res: Response,
   ): Promise<Response> => {
      const { username, password } = req.oauth2!;

      const user = await authService.validateUser(username, password);
      const token = authService.generateToken(user);

      console.log(user, token);

      return res.json({
         access_token: token,
         token_type: 'bearer',
      });
   },
   testToken: (
      req: Request,
      res: Response,
   ): Promise<Response> => {
      return res.json(req.user);
   },

   login: async (req: Request, res: Response): Promise<Response> => {
      const userInput = req.body;
      const user = await authService.validateUser(
         userInput.email,
         userInput.password,
      );
      const token = authService.generateToken(user);

      return res.json({
         message: 'Login successful',
         token,
      });
   },
};

export default () => {
   const router = Router();

   router.post('/register', controllers.register);
   router.post('/login', controllers.login);
   router.post('/login/access-token', parseOAuth2Form, controllers.accessToken);
   router.post(
      '/login/test-token',
      authenticateToken,
      controllers.testToken,
   );

   return router;
};
