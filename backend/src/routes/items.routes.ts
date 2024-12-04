import { Router } from 'express';
import { validateRequest } from 'zod-express-middleware';
import itemsControllers from 'controllers/items.controllers.ts';
import { Item, QueryItem } from 'models/items.model.ts';
import { UserId } from 'models/users.model.ts';

export default () => {
   const router = Router();

   router.route('/')
      .get(
         validateRequest({ query: QueryItem }),
         itemsControllers.queryItem,
      )
      .post(
         validateRequest({ body: Item }),
         itemsControllers.addItem,
      );

   router.route('/:id')
      .all(validateRequest({ params: UserId }))
      .get(itemsControllers.getItem)
      .put(itemsControllers.modifyItem)
      .delete(itemsControllers.deleteItem);

   return router;
};
