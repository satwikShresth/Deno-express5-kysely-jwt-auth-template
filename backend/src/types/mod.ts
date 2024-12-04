import { NextFunction, Request, Response } from 'express';

// Type of an Express middleware
export type Middleware = (
   req: Request,
   res: Response,
   next: NextFunction,
) => void | Promise<void>;

export interface User {
   id: string;
   email: string;
   full_name?: string;
   hashed_password: string;
   is_active: boolean;
   is_superuser: boolean;
}

export interface UserInput {
   email: string;
   password: string;
}

export interface JwtPayload {
   userId: number;
   email: string;
}

export interface AuthRequest extends Request {
   headers?: { authorization: string } | undefined;
   user?: { id: string; is_superuser: boolean; is_active: boolean };
}
