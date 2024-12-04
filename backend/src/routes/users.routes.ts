// src/routes/protected/users.routes.ts
import { Router } from 'express';
import { validateRequest } from 'zod-express-middleware';
import { checkSuperUser } from 'middlewares/user.middleware.ts';
import usersControllers from 'controllers/users.controllers.ts';
import {
   ModifyInfo,
   ModifyPassword,
   ModifyUser,
   QueryUser,
   SuperUserSignup,
   UserId,
} from '../models/users.model.ts';

export default () => {
   const router = Router();

   router.route('/me')
      .get(usersControllers.getMyInfo)
      .patch(
         validateRequest({ body: ModifyInfo }),
         usersControllers.modifyCurrUser,
      )
      .delete(usersControllers.deleteCurrUser);

   router.route('/me/password')
      .patch(
         validateRequest({ body: ModifyPassword }),
         usersControllers.updatePassword,
      );

   router.route('/:id')
      .all([checkSuperUser])
      .get(
         validateRequest({ params: UserId }),
         usersControllers.getUser,
      )
      .patch(
         validateRequest({ body: ModifyUser, params: UserId }),
         usersControllers.modifyUser,
      )
      .delete(
         validateRequest({ params: UserId }),
         usersControllers.deleteUser,
      );

   router.route('/')
      .all([checkSuperUser])
      .get(
         validateRequest({ query: QueryUser }),
         usersControllers.queryUser,
      ).post(
         validateRequest({ body: SuperUserSignup }),
         usersControllers.superUserSignup,
      );

   return router;
};
