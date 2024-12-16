import { Hono } from '@hono/hono';
import authRoutes from 'routes/auth.routes.ts';
import usersRoutes from 'routes/users.routes.ts';
import itemsRoutes from 'routes/items.routes.ts';
import { authenticateToken } from 'middlewares/auth.middleware.ts';
import { JwtPayload } from 'models/auth.model.ts';
import type { JwtVariables } from '@hono/hono/jwt';
import { User } from 'models/users.model.ts';

export default () =>
   new Hono()
      .route('/', authRoutes())
      .route(
         '/',
         new Hono<
            { Variables: { jwtPayload: JwtVariables<JwtPayload>; user: User } }
         >()
            .use(
               '/*',
               ...authenticateToken,
            )
            .route('/items/', itemsRoutes())
            .route('/users/', usersRoutes()),
      );
//);
