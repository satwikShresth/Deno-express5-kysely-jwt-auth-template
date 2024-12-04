import { z } from 'zod';

// Reusable z objects
export const password = z
   .string({ required_error: 'Password is required.' })
   .min(8, 'Password must be at least 8 characters long.')
   .max(40, 'Password cannot be more than 40 characters long.');

export const new_password = password
   .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
   .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
   .regex(/\d/, 'Password must contain at least one number.');

export const hashed_password = z.string({
   required_error: 'Hashed password is required.',
});

export const email = z
   .string({ required_error: 'Email is required.' })
   .email('Invalid email address.')
   .max(255, 'Email cannot exceed 255 characters.');

export const full_name = z
   .string()
   .max(255, 'Full name cannot exceed 255 characters.');

export const id = z
   .string({ required_error: 'ID is required.' })
   .uuid('Invalid UUID format.');

export const is_active = z.boolean({
   required_error: 'is_active field is required.',
});

export const is_superuser = z.boolean({
   required_error: 'is_superuser field is required.',
});

export const parseOptionalInt = (
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
