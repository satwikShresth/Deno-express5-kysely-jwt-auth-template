import { z } from 'zod';
import {
   email,
   full_name,
   id,
   is_active,
   new_password,
   password,
} from 'models/common.model.ts';

export const Signup = z
   .object({
      email,
      password: new_password,
      full_name,
      confirm_password: password,
   })
   .strict()
   .refine(
      (data) => data.password === data.confirm_password,
      {
         message: 'New password and confirm password must match.',
         path: ['confirm_password'],
      },
   );
export const Login = z
   .object({ username: email, password }).strict();

export const JwtPayload = z.object({
   id,
   full_name,
   email,
   is_active,
   iat: z.number().int().nonnegative(), // Issued At: Must be a non-negative integer (timestamp)
   // iss: z.string().optional(), // Optional issuer: Uncomment if `iss` is included in the payload
});

export type Signup = z.infer<typeof Signup>;
export type Login = z.infer<typeof Login>;
export type JwtPayload = z.infer<typeof JwtPayload>;
