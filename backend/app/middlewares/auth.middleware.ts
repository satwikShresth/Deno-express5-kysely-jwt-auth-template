import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { CONFIG } from '../config.ts';
import { AuthRequest, JwtPayload } from 'app/types';
import { db } from 'db';

export async function authenticateToken(
   req: AuthRequest,
   res: Response,
   next: NextFunction,
) {
   const token: string | undefined = req.headers?.authorization?.split(' ')[1];

   if (!token) {
      return res.status(401).json({ message: 'Authentication token required' });
   }

   try {
      const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as { id: string };

      const user = await db
         .selectFrom('user')
         .select(['id', 'full_name', 'email', 'is_superuser', 'is_active'])
         .where('id', '=', decoded.id)
         .executeTakeFirst();

      if (!user) {
         return res.status(404).json({ message: 'User not found' });
      }

      req.user = user;

      next();
   } catch (error) {
      return res.status(403).json({
         message: `Authentication Error: ${error}`,
      });
   }
}
