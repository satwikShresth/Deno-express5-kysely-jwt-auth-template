import { Request, Response } from 'express';
import { User } from 'db/types';
import { authService } from 'services/auth.service.ts';
import {
   ModifyInfo,
   ModifyPassword,
   ModifyUser,
   QueryUser,
   SuperUserSignup,
   UserId,
} from '../models/users.model.ts';

export default {
   superUserSignup: async (req: Request, res: Response): Promise<Response> => {
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
      return res.status(201).json({ message: 'User registered successfully' });
   },

   queryUser: async (req: Request, res: Response) => {
      const { skip = 0, limit = 100 } = await QueryUser.parseAsync(req.query);
      const result = await authService.queryUsers(Number(skip), Number(limit));
      res.json(result);
   },

   getMyInfo: (req: Request, res: Response) => {
      res.json(req.user);
   },

   getUser: async (req: Request, res: Response) => {
      const { id }: UserId = await UserId.parseAsync(req.params);
      const user = await authService.findUserById(id);
      if (!user) {
         return res.status(404).json({ detail: 'User not found' });
      }
      return res.json(user);
   },

   modifyCurrUser: async (req: Request, res: Response) => {
      const user = req.user as User;
      const body: ModifyInfo = await ModifyInfo.parseAsync(req.body);
      const updatedUser = await authService.updateUser(user.id, body);
      res.json(updatedUser);
   },

   updatePassword: async (req: Request, res: Response) => {
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

   modifyUser: async (req: Request, res: Response) => {
      const body: ModifyUser = await ModifyUser.parseAsync(req.body);
      console.log(body);
      const updatedUser = await authService.updateUser(
         req.params.id,
         body,
      );
      res.json(updatedUser);
   },

   deleteCurrUser: async (req: Request, res: Response) => {
      const user = req.user as User;
      await authService.deleteUser(user.id);
      res.json({ message: 'User deleted successfully' });
   },

   deleteUser: async (req: Request, res: Response) => {
      const { id }: UserId = await UserId.parseAsync(req.params);
      await authService.deleteUser(id);
      res.json({ message: 'User deleted successfully' });
   },
} as const;
