// src/routes/protected/users.routes.ts
import { Router } from 'express';
import { validateRequest } from 'zod-express-middleware';
import { checkSuperUser } from 'middlewares/user.middleware.ts';
import { authenticateToken } from 'middlewares/auth.middleware.ts';
import usersControllers from 'controllers/users.controllers.ts';
import {
   ModifyInfo,
   ModifyPassword,
   ModifyUser,
   Signup,
   SuperUserSignup,
   UserQuery,
} from '../models/users.model.ts';

export default () => {
   const router = Router();

   router.post(
      '/signup',
      validateRequest({ body: Signup }),
      usersControllers.signup,
   );

   router.route('/me')
      .all([authenticateToken])
      .get(usersControllers.getMyInfo)
      .patch(
         validateRequest({ body: ModifyInfo }),
         usersControllers.modifyCurrUser,
      )
      .delete(usersControllers.deleteCurrUser);

   router.route('/me/password')
      .all([authenticateToken])
      .patch(
         validateRequest({ body: ModifyPassword }),
         usersControllers.updatePassword,
      );

   router.route('/:id')
      .all([authenticateToken, checkSuperUser])
      .get(usersControllers.getUser)
      .patch(
         validateRequest({ body: ModifyUser }),
         usersControllers.modifyUser,
      )
      .delete(usersControllers.deleteUser);

   router.route('/')
      .all([authenticateToken, checkSuperUser])
      .get(
         validateRequest({ query: UserQuery }),
         usersControllers.queryUser,
      ).post(
         validateRequest({ body: SuperUserSignup }),
         usersControllers.superUserSignup,
      );

   return router;
};
