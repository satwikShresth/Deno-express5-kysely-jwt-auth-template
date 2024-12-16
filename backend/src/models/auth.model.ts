// auth.model.ts
import { Static, Type } from '@sinclair/typebox';
import {
   email,
   full_name,
   id,
   new_password,
   password,
} from 'models/common.model.ts';

export const Signup = Type.Object({
   email,
   password: new_password,
   full_name,
}, {
   additionalProperties: false,
});

export const Login = Type.Object({
   username: email,
   password,
}, {
   additionalProperties: false,
});

export const JwtPayload = Type.Object({
   id,
   iat: Type.Integer({ minimum: 0 }),
   exp: Type.Integer({ minimum: 0 }),
});

export type Signup = Static<typeof Signup>;
export type Login = Static<typeof Login>;
export type JwtPayload = Static<typeof JwtPayload>;
