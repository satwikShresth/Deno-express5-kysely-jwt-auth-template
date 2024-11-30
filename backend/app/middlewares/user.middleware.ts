import { NextFunction, Request, Response } from 'express';
import { User } from 'db/types';

export const checkSuperUser = (
   req: Request,
   res: Response,
   next: NextFunction,
) => {
   if (!(req.user as User)?.is_superuser) {
      return res.status(403).json({
         detail: "The user doesn't have enough privileges",
      });
   }
   next();
};
