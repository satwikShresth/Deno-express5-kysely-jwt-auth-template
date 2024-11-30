import { Request, Response, Router } from 'express';
import { authService } from 'services/auth.service.ts';

const controllers = {
   register: async (
      req: Request,
      res: Response,
   ): Promise<Response> => {
      const userInput = req.body;
      console.log(userInput);

      if (!userInput.email || !userInput.password) {
         return res.status(400).json({
            message: 'Username and password are required',
         });
      }

      await authService.registerUser(userInput);
      return res.status(201).json({
         message: 'User registered successfully',
      });
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
   console.log('- /register');
   router.post('/login', controllers.login);
   console.log('- /login');

   return router;
};
