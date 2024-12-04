import { Router } from 'express';
import itemsControllers from 'controllers/items.controllers.ts';

export default () => {
   const router = Router();

   router.route('/')
      .get(itemsControllers.queryItem)
      .post(itemsControllers.addItem);

   router.route('/:id')
      .get(itemsControllers.getItem)
      .put(itemsControllers.modifyItem)
      .delete(itemsControllers.deleteItem);

   return router;
};
