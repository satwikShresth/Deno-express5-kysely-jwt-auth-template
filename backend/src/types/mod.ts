import { Request } from 'express';

export interface User {
   id: number;
   email: string;
   password: string;
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
