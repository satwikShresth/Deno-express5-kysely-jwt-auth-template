import { NextFunction, Request, Response } from 'express';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const parseFormData = (
   req: Request,
   res: Response,
   next: NextFunction,
): void => {
   upload.any()(req, res, (err: unknown) => {
      if (err) {
         res.status(400).json({ error: 'Failed to parse form data' });
         return;
      }
      next();
   });
};
