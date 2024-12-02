import { NextFunction, Request, Response } from 'express';
import { User } from 'db/types';
import vine, { SimpleMessagesProvider, VineValidator } from '@vinejs/vine';

const messages = new SimpleMessagesProvider({
   'required': 'The {{ field }} field is required',
   'email.email': 'Please enter a valid email address',
   'string.email': 'Please enter a valid email address',
   'string.minLength': 'The {{ field }} must be at least {{ min }} characters',
   'string.maxLength': 'The {{ field }} cannot exceed {{ max }} characters',
});

export function validateBody(schema: any) {
   return async (req: Request, res: Response, next: NextFunction) => {
      try {
         const validator = vine.compile(schema);
         req.body = await validator.validate(req.body);
         next();
      } catch (error: any) {
         if (error.messages) {
            return res.status(400).json({
               message: 'Validation failed',
               errors: error.messages,
            });
         }
         next(error);
      }
   };
}

export const checkSuperUser = (
   req: Request,
   res: Response,
   next: NextFunction,
) => {
   if (!req.user?.is_superuser) {
      throw new Error('Not enough privileges');
   }
   next();
};
