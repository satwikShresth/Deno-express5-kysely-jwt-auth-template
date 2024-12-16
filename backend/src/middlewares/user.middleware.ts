import { Context, Next } from '@hono/hono';
import { createFactory } from '@hono/hono/factory';

const factory = createFactory();

export const checkSuperUser = factory.createMiddleware(
   async (
      ctx: Context,
      next: Next,
   ) => {
      if (!ctx.get('user')?.is_superuser) {
         throw new Error('Not enough privileges');
      }
      await next();
   },
);
