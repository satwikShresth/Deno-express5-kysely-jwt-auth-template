// src/routes/protected/users.routes.ts
import { Request, Response, Router } from 'express';
import { authService } from 'services/auth.service.ts';
import {
   ModifyInfo,
   ModifyPassword,
   ModifyUser,
   QueryUser,
   SuperUserSignup,
   User,
   UserId,
} from 'models/users.model.ts';
import { validateRequest } from 'zod-express-middleware';
import { checkSuperUser } from 'middlewares/user.middleware.ts';

export default () => {
   const router = Router();

   router.route('/me')
      .get(
         (req: Request, res: Response) => {
            res.json(req.user);
         },
      )
      .patch(
         validateRequest({ body: ModifyInfo }),
         async (req: Request, res: Response) => {
            const user = req.user as User;
            const body: ModifyInfo = await ModifyInfo.parseAsync(req.body);
            const updatedUser = await authService.updateUser(user.id, body);
            res.json(updatedUser);
         },
      )
      .delete(
         async (req: Request, res: Response) => {
            const user = req.user as User;
            await authService.deleteUser(user.id);
            res.json({ message: 'User deleted successfully' });
         },
      );

   router.route('/me/password')
      .patch(
         validateRequest({ body: ModifyPassword }),
         async (req: Request, res: Response) => {
            const user = req.user as User;
            const { current_password, new_password, confirm_password }:
               ModifyPassword = await ModifyPassword.parseAsync(req.body);

            if (new_password !== confirm_password) {
               return res.status(400).json({
                  detail: "New password and confirm password don't match",
               });
            }

            await authService.modifyCredentials(
               user.id,
               current_password,
               new_password,
            );
            return res.json({ message: 'Password updated successfully' });
         },
      );

   router.route('/:id')
      .all([checkSuperUser])
      .get(
         validateRequest({ params: UserId }),
         async (req: Request, res: Response) => {
            const { id }: UserId = await UserId.parseAsync(req.params);
            const user = await authService.findUserById(id);
            if (!user) {
               return res.status(404).json({ detail: 'User not found' });
            }
            return res.json(user);
         },
      )
      .patch(
         validateRequest({ body: ModifyUser, params: UserId }),
         async (req: Request, res: Response) => {
            const body: ModifyUser = await ModifyUser.parseAsync(req.body);
            const updatedUser = await authService.updateUser(
               req.params.id,
               body,
            );
            res.json(updatedUser);
         },
      )
      .delete(
         validateRequest({ params: UserId }),
         async (req: Request, res: Response) => {
            const { id }: UserId = await UserId.parseAsync(req.params);
            await authService.deleteUser(id);
            res.json({ message: 'User deleted successfully' });
         },
      );

   router.route('/')
      .all([checkSuperUser])
      .get(
         validateRequest({ query: QueryUser }),
         async (req: Request, res: Response) => {
            const { skip = 0, limit = 100 } = await QueryUser.parseAsync(
               req.query,
            );
            const result = await authService.queryUsers(
               Number(skip),
               Number(limit),
            );
            res.json(result);
         },
      )
      .post(
         validateRequest({ body: SuperUserSignup }),
         async (req: Request, res: Response): Promise<Response> => {
            const { email, password, full_name, is_active, is_superuser }:
               SuperUserSignup = await SuperUserSignup
                  .parseAsync(
                     req.body,
                  );

            await authService.registerUser(
               email,
               password,
               full_name,
               is_active,
               is_superuser,
            );
            return res.status(201).json({
               message: 'User registered successfully',
            });
         },
      );

   return router;
};
