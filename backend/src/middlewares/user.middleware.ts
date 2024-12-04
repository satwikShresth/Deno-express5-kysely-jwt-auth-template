import { NextFunction, Request, Response } from 'express';

export const checkSuperUser = (
   req: Request,
   _res: Response,
   next: NextFunction,
) => {
   if (!req.user?.is_superuser) {
      throw new Error('Not enough privileges');
   }
   req.is_superuser = true;
   next();
};
