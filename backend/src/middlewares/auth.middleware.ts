import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JwtPayload } from 'app/types';
import multer from 'multer';
import { db } from 'db';

const upload = multer();

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
      const decoded = jwt.verify(token, Deno.env.get('JWT_SECRET')) as {
         id: string;
      };

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

export function parseOAuth2Form(
   req: Request,
   res: Response,
   next: NextFunction,
) {
   // Use multer to parse multipart/form-data
   upload.none()(req, res, (err) => {
      if (err) {
         return res.status(400).json({ message: 'Error parsing form data' });
      }

      const username = req.body?.username;
      const password = req.body?.password;
      const scope = req.body?.scope || '';
      const grant_type = req.body?.grant_type;
      const client_id = req.body?.client_id;
      const client_secret = req.body?.client_secret;

      // Validate required fields
      if (!username || !password) {
         return res.status(400).json({
            message: 'Username and password are required',
         });
      }

      // Optional validation for grant_type
      if (grant_type && grant_type !== 'password') {
         return res.status(400).json({
            message: 'grant_type must be "password"',
         });
      }

      // Parse scope string into array
      const scopes = scope ? scope.split(' ') : [];

      // Attach OAuth2 data to request
      req.oauth2 = {
         grant_type,
         username,
         password,
         scopes,
         client_id,
         client_secret,
      };

      next();
   });
}
