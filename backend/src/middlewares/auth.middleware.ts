import { Context, Next } from '@hono/hono';
import { authService } from 'services/auth.service.ts';
import { User } from 'models/users.model.ts';
import { jwt } from '@hono/hono/jwt';
import { HTTPException } from '@hono/hono/http-exception';
import { createFactory } from '@hono/hono/factory';

const factory = createFactory();

export const authenticateToken = [
   factory.createMiddleware(async (
      ctx: Context,
      next: Next,
   ) =>
      await jwt({
         secret: Deno.env.get('JWT_SECRET') || 'your-default-secret',
      })(
         ctx,
         next,
      )
   ),
   factory.createMiddleware(
      async (ctx: Context, next: Next) => {
         try {
            const jwtPayload = await ctx.get('jwtPayload');

            if (!jwtPayload) {
               throw new HTTPException(401, {
                  message: 'Invalid or missing token',
               });
            }

            const user = await authService.validateJwtToken(jwtPayload);

            if (!user) {
               throw new HTTPException(401, {
                  message: 'User not found or invalid',
               });
            }

            ctx.set('user', user as User);

            await next();
         } catch (error) {
            console.error('Auth Error:', error);

            if (error instanceof HTTPException) {
               return ctx.json(
                  {
                     error: error.message,
                     status: error.status,
                  },
                  error.status,
               );
            }

            return ctx.json(
               {
                  error: 'Authentication failed',
                  status: 401,
               },
               401,
            );
         }
      },
   ),
];
