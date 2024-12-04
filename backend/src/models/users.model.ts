import { z } from 'zod';

// Reusable z objects
const password = z
   .string({ required_error: 'Password is required.' })
   .min(8, 'Password must be at least 8 characters long.')
   .max(40, 'Password cannot be more than 40 characters long.')
   .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
   .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
   .regex(/\d/, 'Password must contain at least one number.');

const email = z
   .string({ required_error: 'Email is required.' })
   .email('Invalid email address.')
   .max(255, 'Email cannot exceed 255 characters.');

const full_name = z
   .string()
   .max(255, 'Full name cannot exceed 255 characters.')
   .optional();

const full_name_required = z
   .string({ required_error: 'Full name is required.' })
   .max(255, 'Full name cannot exceed 255 characters.');

const id = z
   .string({ required_error: 'ID is required.' })
   .uuid('Invalid UUID format.');

const is_active = z.boolean({
   required_error: 'is_active field is required.',
});

const is_superuser = z.boolean({
   required_error: 'is_superuser field is required.',
});

const hashed_password = z.string({
   required_error: 'Hashed password is required.',
});

const current_password = z
   .string({ required_error: 'Current password is required.' })
   .min(8, 'Current password must be at least 8 characters long.');

const confirm_password = z.string({ required_error: 'Password did not match' });

const parseOptionalInt = (
   fieldName: string,
   minValue: number,
   maxValue?: number,
) =>
   z.preprocess(
      (
         value,
      ) => (value === undefined ? undefined : parseInt(value as string, 10)),
      z
         .number({ invalid_type_error: `${fieldName} must be a number.` })
         .int(`${fieldName} must be an integer.`)
         .min(minValue, `${fieldName} must be at least ${minValue}.`)
         .max(
            maxValue ?? Infinity,
            maxValue ? `${fieldName} cannot exceed ${maxValue}.` : '',
         )
         .optional(),
   );

// s
export const Signup = z
   .object({ email, password, full_name, confirm_password }).strict().refine(
      (data) => data.password === data.confirm_password,
      {
         message: 'New password and confirm password must match.',
         path: ['confirm_password'],
      },
   );

export const SuperUserSignup = z.object({
   email,
   password,
   full_name,
   confirm_password,
   is_active,
   is_superuser,
}).strict().refine(
   (data) => data.password === data.confirm_password,
   {
      message: 'New password and confirm password must match.',
      path: ['confirm_password'],
   },
);

export const ModifyInfo = z.object({
   full_name,
   email,
});

export const ModifyPassword = z
   .object({
      current_password,
      new_password: password,
      confirm_password,
   })
   .refine((data) => data.new_password === data.confirm_password, {
      message: 'New password and confirm password must match.',
      path: ['confirm_password'],
   });

export const UserQuery = z.object({
   skip: parseOptionalInt('Skip', 0),
   limit: parseOptionalInt('Limit', 1, 1000),
});

export const ModifyUser = z
   .preprocess(
      (data) => {
         const obj = data as any;
         if (!obj.password) {
            delete obj.confirm_password;
         }
         return obj;
      },
      z.object({
         id,
         email,
         is_active,
         is_superuser,
         full_name: full_name_required,
         hashed_password,
         password: password.optional(),
         confirm_password: confirm_password.optional(),
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

// Types
export type ModifyUser = z.infer<typeof ModifyUser>;
export type UserQuery = z.infer<typeof UserQuery>;
export type Signup = z.infer<typeof Signup>;
export type SuperUserSignup = z.infer<typeof SuperUserSignup>;
export type ModifyInfo = z.infer<typeof ModifyInfo>;
export type ModifyPassword = z.infer<typeof ModifyPassword>;

