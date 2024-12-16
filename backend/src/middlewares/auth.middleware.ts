import { NextFunction, Request, Response } from 'express';
import { authService } from 'services/auth.service.ts';
import { JwtPayload } from 'models/auth.model.ts';

export async function authenticateToken(
   req: Request,
   res: Response,
   next: NextFunction,
) {
   const token: string | undefined = req.headers?.authorization?.split(' ')[1];

   if (!token) {
      return res.status(401).json({ message: 'Authentication token required' });
   }

   const payload = authService.decodeJwtToken(token);
   const parsed = JwtPayload.safeParse(payload);

   if (!parsed.success) {
      res.status(400).send({ type: 'JwtToken', errors: parsed.error });
   }

   const user = await authService.validateJwtToken(parsed.data as JwtPayload);

   req.user = user;

   next();
}
