import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { CONFIG } from '../../config.ts';
import { AuthRequest, JwtPayload } from 'app/types';

export const authenticateToken = (
   req: AuthRequest,
   res: Response,
   next: NextFunction,
): Response | void => {
   const authHeader = req.headers['authorization'];
   const token = authHeader?.split(' ')[1];
   console.log(`Token: ${token}`);

   if (!token) {
      return res.status(401).json({ message: 'Authentication token required' });
   }

   try {
      const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as JwtPayload;
      req.user = decoded;
      next();
   } catch (error) {
      return res.status(403).json({ message: 'Invalid token' });
   }
};
