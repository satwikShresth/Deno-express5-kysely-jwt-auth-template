import { Request } from 'express';

export interface User {
   id: number;
   username: string;
   password: string;
}

export interface UserInput {
   username: string;
   password: string;
}

export interface JwtPayload {
   userId: number;
   username: string;
}

export interface AuthRequest extends Request {
   user?: JwtPayload;
}
