import { NextFunction, Request, Response } from 'express';
import { authService } from 'services/auth.service.ts';
import { JwtPayload } from 'models/auth.model.ts';

export const authenticateToken = (
   req: Request,
   res: Response,
   next: NextFunction,
) => {
   const token: string | undefined = req.headers?.authorization?.split(' ')[1];

   if (!token) {
      return res.status(401).json({ message: 'Authentication token required' });
   }

   const payload = authService.decodeJwtToken(token);
   const parsed = JwtPayload.safeParse(payload);

   if (!parsed.success) {
      res.status(400).send({ type: 'JwtToken', errors: parsed.error });
   }

   req.user = parsed.data as JwtPayload;

   next();
};

export const checkSuperUser = async (
   req: Request,
   res: Response,
   next: NextFunction,
) => {
   const user = await authService.validateJwtToken(req.user);

   if (!user.is_superuser) {
      return res.status(403).json({ message: 'Forbidden Acesss' });
   }
   next();
};
