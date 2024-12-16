// @ts-nocheck because I dont want them yelling at me
import { Context, Hono } from '@hono/hono';
import { Login, Signup } from 'models/auth.model.ts';
import { authenticateToken } from 'middlewares/auth.middleware.ts';
import { authService } from 'services/auth.service.ts';
import { tbValidator } from '@hono/typebox-validator';
import { describeRoute } from 'hono-openapi';

export default () =>
   new Hono()
      .post(
         '/signup',
         describeRoute({
            tags: ['Authentication'],
            summary: 'Register a new user',
            description:
               'Create a new user account with email, password, and full name',
            requestBody: {
               content: { 'application/json': { schema: Signup } },
            },
         }),
         tbValidator('json', Signup),
         async (ctx: Context) => {
            const { email, password, full_name } = ctx.req.valid('json');
            await authService.registerUser(
               email,
               password,
               full_name,
            );
            return ctx
               .json({
                  message: 'User registered successfully',
               }, 201);
         },
      )
      .post(
         '/login/access-token',
         describeRoute({
            tags: ['Authentication'],
            summary: 'Login to get access token',
            description: 'Authenticate user credentials and return a JWT token',
            requestBody: {
               content: {
                  'application/x-www-form-urlencoded': { schema: Login },
               },
            },
         }),
         tbValidator('form', Login),
         async (ctx: Context) => {
            const { username, password } = ctx.req.valid('form');
            console.log({ username, password });
            const user = await authService.validateUser(username, password);
            const token = await authService.generateToken(user);
            return ctx
               .json({
                  access_token: token,
                  token_type: 'bearer',
               }, 200);
         },
      )
      .post(
         '/login/test-token',
         describeRoute({
            tags: ['Authentication'],
            summary: 'Test authentication token',
            description: 'Verify if the provided JWT token is valid',
            security: [
               {
                  bearerAuth: [],
               },
            ],
         }),
         ...authenticateToken,
         (ctx: Context) => {
            return ctx.json({
               message: 'Success',
            });
         },
      );

