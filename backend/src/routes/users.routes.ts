// @ts-nocheck because I dont want them yelling at me
import { Context, Hono } from '@hono/hono';
import {
   ModifyInfo,
   ModifyPassword,
   ModifyUser,
   QueryUser,
   SuperUserSignup,
   User,
   UserId,
} from 'models/users.model.ts';
import { tbValidator } from '@hono/typebox-validator';
import { authService } from 'services/auth.service.ts';
import { HTTPException } from '@hono/hono/http-exception';
import { checkSuperUser } from 'middlewares/user.middleware.ts';

export default () =>
   new Hono()
      .get(
         '/me',
         async (ctx: Context) => ctx.json(await ctx.get('user')),
      )
      .patch(
         '/me',
         tbValidator('json', ModifyInfo),
         async (ctx: Context) => {
            const user = await ctx.get('user') as User;
            const body: ModifyInfo = ctx.req.valid('json');
            const updatedUser = await authService.updateUser(user.id, body);
            return ctx.json(updatedUser);
         },
      )
      .delete(
         '/me',
         async (ctx: Context) => {
            const user = await ctx.get('user') as User;
            await authService.deleteUser(user.id);
            return ctx.json({ message: 'User deleted successfully' });
         },
      )
      .patch(
         '/me/password',
         tbValidator('json', ModifyPassword),
         async (ctx: Context) => {
            const user = await ctx.get('user') as User;
            const {
               current_password,
               new_password,
               confirm_password,
            }: ModifyPassword = ctx.req.valid('json');

            if (new_password !== confirm_password) {
               throw new HTTPException(400, {
                  message: "New password and confirm password don't match",
               });
            }

            await authService.modifyCredentials(
               user.id,
               current_password,
               new_password,
            );
            return ctx.json({ message: 'Password updated successfully' });
         },
      )
      .use('/*', checkSuperUser)
      .get(
         '/:id',
         tbValidator('param', UserId),
         async (ctx: Context) => {
            const { id }: UserId = ctx.req.valid('param');
            const user = await authService.findUserById(id);
            if (!user) {
               throw new HTTPException(404, {
                  message: 'User not found',
               });
            }
            return ctx.json(user);
         },
      )
      .patch(
         '/:id',
         tbValidator('param', UserId),
         tbValidator('json', ModifyUser),
         async (ctx: Context) => {
            const { id }: UserId = ctx.req.valid('param');
            const body: ModifyUser = ctx.req.valid('json');
            const updatedUser = await authService.updateUser(
               id,
               body,
            );
            return ctx.json(updatedUser);
         },
      )
      .delete(
         '/:id',
         tbValidator('param', UserId),
         async (ctx: Context) => {
            const { id }: UserId = ctx.req.valid('param');
            await authService.deleteUser(id);
            return ctx.json({ message: 'User deleted successfully' });
         },
      )
      .get(
         '/',
         tbValidator('query', QueryUser),
         async (ctx: Context) => {
            const { skip = 0, limit = 100 } = ctx.req.valid('query');
            const result = await authService.queryUsers(
               Number(skip),
               Number(limit),
            );
            return ctx.json(result);
         },
      )
      .post(
         '/',
         tbValidator('json', SuperUserSignup),
         async (ctx: Context) => {
            const { email, password, full_name, is_active, is_superuser }:
               SuperUserSignup = ctx.req.valid('json');

            await authService.registerUser(
               email,
               password,
               full_name,
               is_active,
               is_superuser,
            );
            return ctx.json({
               message: 'User registered successfully',
            });
         },
      );
