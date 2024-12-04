import { NextFunction, Request, Response } from 'express';

export type Middleware = (
   req: Request,
   res: Response,
   next: NextFunction,
) => void | Promise<void>;

export interface User {
   id: string;
   email: string;
   full_name?: string;
   hashed_password?: string;
   is_active: boolean;
   is_superuser: boolean;
}
