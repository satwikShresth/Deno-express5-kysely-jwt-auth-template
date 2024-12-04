import { Request, Response } from 'express';
import { authService } from 'services/auth.service.ts';

const register = async (
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
};

const accessToken = async (
   req: Request,
   res: Response,
): Promise<Response> => {
   const { username, password } = req.oauth2!;

   const user = await authService.validateUser(username, password);
   const token = authService.generateToken(user);

   return res.json({
      access_token: token,
      token_type: 'bearer',
   });
};

const testToken = (
   req: Request,
   res: Response,
): Promise<Response> => {
   return res.json(req.user);
};

const login = async (req: Request, res: Response): Promise<Response> => {
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
};

export default { register, accessToken, testToken, login };
