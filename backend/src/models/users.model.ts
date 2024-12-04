import { z } from 'zod';
import {
   email,
   full_name,
   hashed_password,
   id,
   is_active,
   is_superuser,
   new_password,
   parseOptionalInt,
   password,
} from './common.model.ts';

// SuperUserSignup Schema
export const SuperUserSignup = z
   .object({
      email,
      password,
      full_name: full_name.optional(),
      confirm_password: password,
      is_active,
      is_superuser,
   })
   .strict()
   .refine((data) => data.password === data.confirm_password, {
      message: 'New password and confirm password must match.',
      path: ['confirm_password'],
   });

// ModifyInfo Schema
export const ModifyInfo = z.object({
   full_name,
   email,
});

// ModifyPassword Schema
export const ModifyPassword = z
   .object({
      current_password: password,
      new_password: new_password,
      confirm_password: password,
   })
   .refine((data) => data.new_password === data.confirm_password, {
      message: 'New password and confirm password must match.',
      path: ['confirm_password'],
   });

// QueryUser Schema
export const QueryUser = z.object({
   skip: parseOptionalInt('Skip', 0),
   limit: parseOptionalInt('Limit', 1, 1000),
});

// ModifyUser Schema
export const ModifyUser = z
   .preprocess(
      (data) => {
         const obj = data as Record<string, unknown>; // Type-casting for preprocess
         if (!obj?.password) {
            delete obj.confirm_password;
         }
         return obj;
      },
      z.object({
         id,
         email,
         is_active,
         is_superuser,
         full_name: full_name.optional(),
         hashed_password,
         password: password.optional(),
         confirm_password: password.optional(),
      }),
   )
   .superRefine((data, ctx) => {
      if (
         data.password &&
         data.confirm_password &&
         data.password !== data.confirm_password
      ) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['confirm_password'],
            message: 'Password and confirm password must match.',
         });
      }
   });

// UserId Schema
export const UserId = z.object({
   id,
});

// Types extracted from schemas
export type UserId = z.infer<typeof UserId>;
export type ModifyUser = z.infer<typeof ModifyUser>;
export type QueryUser = z.infer<typeof QueryUser>;
export type SuperUserSignup = z.infer<typeof SuperUserSignup>;
export type ModifyInfo = z.infer<typeof ModifyInfo>;
export type ModifyPassword = z.infer<typeof ModifyPassword>;

