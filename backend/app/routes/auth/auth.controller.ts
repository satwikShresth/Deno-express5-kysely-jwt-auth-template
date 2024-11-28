import { Request, Response } from 'express';
import { authService } from '../../service/auth.service.ts';
import { UserInput } from 'app/types';

export const register = async (
   req: Request,
   res: Response,
): Promise<Response> => {
   try {
      const userInput: UserInput = req.body;

      if (!userInput.username || !userInput.password) {
         return res.status(400).json({
            message: 'Username and password are required',
         });
      }

      await authService.registerUser(userInput);
      return res.status(201).json({
         message: 'User registered successfully',
      });
   } catch (error) {
      if (
         error instanceof Error &&
         error.message === 'Username already exists'
      ) {
         return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error registering user' });
   }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
   try {
      const userInput: UserInput = req.body;
      const user = await authService.validateUser(userInput);
      const token = authService.generateToken(user);

      return res.json({
         message: 'Login successful',
         token,
      });
   } catch (error) {
      if (
         error instanceof Error && error.message === 'Invalid credentials'
      ) {
         return res.status(401).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error logging in' });
   }
};
