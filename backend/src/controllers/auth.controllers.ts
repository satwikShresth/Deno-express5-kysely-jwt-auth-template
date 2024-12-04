import { Request, Response } from 'express';
import { authService } from 'services/auth.service.ts';
import { Login, Signup } from '../models/auth.model.ts';

export default {
   signup: async (req: Request, res: Response): Promise<Response> => {
      const { email, password, full_name }: Signup = await Signup.parseAsync(
         req.body,
      );

      await authService.registerUser(
         email,
         password,
         full_name,
      );
      return res.status(201).json({ message: 'User registered successfully' });
   },

   accessToken: async (
      req: Request,
      res: Response,
   ): Promise<Response> => {
      const { username, password } = await Login.parseAsync(req.body!);

      const user = await authService.validateUser(username, password);
      const token = authService.generateToken(user);

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
} as const;
