// src/routes/protected/users.routes.ts
import { Request, Response, Router } from 'express';
import { User, UserUpdate } from 'db/types';
import { checkSuperUser, validateBody } from 'middlewares/user.middleware.ts';
import { db } from 'db';
import { authenticateToken } from 'middlewares/auth.middleware.ts';
import vine from '@vinejs/vine';
import { authService } from 'services/auth.service.ts';

export const registerSchema = vine.object({
   email: vine.string()
      .email()
      .maxLength(255),
   password: vine.string()
      .minLength(8)
      .maxLength(40),
   full_name: vine.string()
      .maxLength(255)
      .optional(),
});

const controllers = {
   signup: async (
      req: Request,
      res: Response,
   ): Promise<Response> => {
      const { email, password, full_name } = req.body;
      console.log({ email, password, full_name });

      if (!email || !password) {
         return res.status(400).json({
            message: 'Username and password are required',
         });
      }

      await authService.registerUser(email, password, full_name);
      return res.status(201).json({
         message: 'User registered successfully',
      });
   },

   getQueryUser: async (req: Request, res: Response) => {
      const { skip = 0, limit = 100 } = req.query;

      const users = await db
         .selectFrom('user')
         .selectAll()
         .limit(Number(limit))
         .offset(Number(skip))
         .execute();

      const count = await db
         .selectFrom('user')
         .select(db.fn.count('id').as('count'))
         .executeTakeFirst();

      res.json({ data: users, count: Number(count?.count || 0) });
   },

   getMe: (req: Request, res: Response) => {
      res.json(req.user);
   },

   getUserById: async (req: Request, res: Response) => {
      const { id } = req.params;

      const requestedUser = await db
         .selectFrom('user')
         .selectAll()
         .where('id', '=', id)
         .executeTakeFirst();

      if (!requestedUser) {
         return res.status(404).json({ detail: 'User not found' });
      }

      return res.json(requestedUser);
   },

   patchMe: async (req: Request, res: Response) => {
      const user = req.user as User;
      const userData: UserUpdate = req.body;

      if (userData.email) {
         const existingUser = await db
            .selectFrom('user')
            .selectAll()
            .where('email', '=', userData.email)
            .where('id', '!=', user.id)
            .executeTakeFirst();

         if (existingUser) {
            return res.status(409).json({
               detail: 'User with this email already exists',
            });
         }
      }

      const updatedUser = await db
         .updateTable('user')
         .set(userData)
         .where('id', '=', user.id)
         .returningAll()
         .executeTakeFirst();

      res.json(updatedUser);
   },

   deleteUser: async (req: Request, res: Response) => {
      const user = req.user as User;

      if (user.is_superuser) {
         return res.status(403).json({
            detail: 'Super users are not allowed to delete themselves',
         });
      }

      await db
         .deleteFrom('item')
         .where('owner_id', '=', user.id)
         .execute();

      await db
         .deleteFrom('user')
         .where('id', '=', user.id)
         .execute();

      res.json({ message: 'User deleted successfully' });
   },

   patchUserById: async (req: Request, res: Response) => {
      const { id } = req.params;
      const userData: UserUpdate = req.body;

      const user = await db
         .selectFrom('user')
         .selectAll()
         .where('id', '=', id)
         .executeTakeFirst();

      if (!user) {
         return res.status(404).json({
            detail: 'The user with this id does not exist in the system',
         });
      }

      if (userData.email) {
         const existingUser = await db
            .selectFrom('user')
            .selectAll()
            .where('email', '=', userData.email)
            .where('id', '!=', id)
            .executeTakeFirst();

         if (existingUser) {
            return res.status(409).json({
               detail: 'User with this email already exists',
            });
         }
      }

      const updatedUser = await db
         .updateTable('user')
         .set(userData)
         .where('id', '=', id)
         .returningAll()
         .executeTakeFirst();

      res.json(updatedUser);
   },

   deleteUserById: async (req: Request, res: Response) => {
      const { id } = req.params;
      const user = req.user as User;

      const userToDelete = await db
         .selectFrom('user')
         .selectAll()
         .where('id', '=', id)
         .executeTakeFirst();

      if (!userToDelete) {
         return res.status(404).json({ detail: 'User not found' });
      }

      if (userToDelete.id === user.id) {
         return res.status(403).json({
            detail: 'Super users are not allowed to delete themselves',
         });
      }

      await db
         .deleteFrom('item')
         .where('owner_id', '=', id)
         .execute();

      await db
         .deleteFrom('user')
         .where('id', '=', id)
         .execute();

      res.json({ message: 'User deleted successfully' });
   },
};

export default () => {
   const router = Router();

   router.post('/signup', validateBody(registerSchema), controllers.signup);

   router.route('/me')
      .all(authenticateToken)
      .get(controllers.getMe)
      .patch(controllers.patchMe)
      .delete(controllers.deleteUser);

   router.route('/:id')
      .all([authenticateToken, checkSuperUser])
      .get(controllers.getUserById)
      .patch(controllers.patchUserById)
      .delete(controllers.deleteUserById);

   router.route('/')
      .all([authenticateToken, checkSuperUser])
      .get(controllers.getQueryUser);

   return router;
};
