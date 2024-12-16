import { Request, Response, Router } from 'express';
import { validateRequest } from 'zod-express-middleware';
import { authenticateToken } from 'middlewares/auth.middleware.ts';
import { parseFormData } from 'middlewares/common.middlware.ts';
import { authService } from 'services/auth.service.ts';
import { Login, Signup } from 'models/auth.model.ts';

export default () => {
   const router = Router();

   router.post(
      '/signup',
      validateRequest({ body: Signup }),
      async (req: Request, res: Response): Promise<Response> => {
         const { email, password, full_name }: Signup = await Signup.parseAsync(
            req.body,
         );

         await authService.registerUser(
            email,
            password,
            full_name,
         );
         return res.status(201).json({
            message: 'User registered successfully',
         });
      },
   );

   router.post(
      '/login/access-token',
      parseFormData,
      validateRequest({ body: Login }),
      async (
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
   );

   router.post(
      '/login/test-token',
      authenticateToken,
      (
         req: Request,
         res: Response,
      ): Promise<Response> => {
         return res.json(req.user);
      },
   );

   return router;
};
