// common.model.ts
import { Type } from '@sinclair/typebox';

// Reusable TypeBox schemas
export const password = Type.String({
   minLength: 8,
   maxLength: 40,
   errorMessage: {
      type: 'Password is required.',
      minLength: 'Password must be at least 8 characters long.',
      maxLength: 'Password cannot be more than 40 characters long.',
   },
});

export const new_password = Type.String({
   minLength: 8,
   maxLength: 40,
   pattern: '^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).+$',
   errorMessage: {
      type: 'Password is required.',
      minLength: 'Password must be at least 8 characters long.',
      maxLength: 'Password cannot be more than 40 characters long.',
      pattern:
         'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
   },
});

export const hashed_password = Type.String({
   errorMessage: {
      type: 'Hashed password is required.',
   },
});

export const email = Type.String({
   format: 'email',
   maxLength: 255,
   errorMessage: {
      type: 'Email is required.',
      format: 'Invalid email address.',
      maxLength: 'Email cannot exceed 255 characters.',
   },
});

export const full_name = Type.String({
   maxLength: 255,
   errorMessage: {
      maxLength: 'Full name cannot exceed 255 characters.',
   },
});

export const id = Type.String({
   format: 'uuid',
   errorMessage: {
      type: 'ID is required.',
      format: 'Invalid UUID format.',
   },
});

export const is_active = Type.Boolean({
   errorMessage: {
      type: 'is_active field is required.',
   },
});

export const is_superuser = Type.Boolean({
   errorMessage: {
      type: 'is_superuser field is required.',
   },
});

export const parseOptionalInt = (
   fieldName: string,
   minValue: number,
   maxValue?: number,
) =>
   Type.Optional(
      Type.Integer({
         minimum: minValue,
         maximum: maxValue ?? undefined,
         errorMessage: {
            type: `${fieldName} must be a number.`,
            format: `${fieldName} must be an integer.`,
            minimum: `${fieldName} must be at least ${minValue}.`,
            maximum: maxValue
               ? `${fieldName} cannot exceed ${maxValue}.`
               : undefined,
         },
      }),
   );

export const QuerySkipLimit = Type.Object({
   skip: parseOptionalInt('Skip', 0),
   limit: parseOptionalInt('Limit', 1, 1000),
});

