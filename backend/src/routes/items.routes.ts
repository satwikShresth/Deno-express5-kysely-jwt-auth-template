import { Request, Response, Router } from 'express';
import { validateRequest } from 'zod-express-middleware';
import { itemService } from 'services/item.service.ts';
import { Item, QueryItem } from 'models/items.model.ts';
import { UserId } from 'models/users.model.ts';
import { ItemUpdate, User } from 'db/types';

export default () => {
   const router = Router();

   router.route('/')
      .get(
         validateRequest({ query: QueryItem }),
         async (req: Request, res: Response) => {
            const { skip = 0, limit = 100 } = QueryItem.parse(req.query);
            const user = req.user as User;

            const items = await itemService.getItems(
               skip,
               limit,
               user.id,
            );
            const count = await itemService.getItemCount(user.id);

            res.json({ data: items, count });
         },
      )
      .post(
         validateRequest({ body: Item }),
         async (req: Request, res: Response) => {
            const { title, description }: Item = await Item.parseAsync(
               req.body,
            );
            const user = req.user as User;

            const newItem = await itemService.createItem(
               title,
               description,
               user.id,
            );

            res.status(201).json(newItem);
         },
      );

   router.route('/:id')
      .all(validateRequest({ params: UserId }))
      .get(
         async (req: Request, res: Response) => {
            const { id }: UserId = await UserId.parseAsync(req.params);
            const user = req.user as User;

            const item = await itemService.getItemById(id);

            if (!item) {
               return res.status(404).json({ detail: 'Item not found' });
            }

            if (!user.is_superuser && item.owner_id !== user.id) {
               return res.status(403).json({
                  detail: 'Not enough permissions',
               });
            }

            res.json(item);
         },
      )
      .put(
         async (req: Request, res: Response) => {
            const { id }: UserId = await UserId.parseAsync(req.params);
            const itemData = req.body as ItemUpdate;
            const user = req.user as User;

            const item = await itemService.getItemById(id);

            if (!item) {
               return res.status(404).json({ detail: 'Item not found' });
            }

            if (!user.is_superuser && item.owner_id !== user.id) {
               return res.status(403).json({
                  detail: 'Not enough permissions',
               });
            }

            const updatedItem = await itemService.updateItem(id, itemData);

            res.json(updatedItem);
         },
      )
      .delete(
         async (req: Request, res: Response) => {
            const { id }: UserId = await UserId.parseAsync(req.params);
            const user = req.user as User;

            const item = await itemService.getItemById(id);

            if (!item) {
               return res.status(404).json({ detail: 'Item not found' });
            }

            if (!user.is_superuser && item.owner_id !== user.id) {
               return res.status(403).json({
                  detail: 'Not enough permissions',
               });
            }

            await itemService.deleteItem(id);

            res.json({ message: 'Item deleted successfully' });
         },
      );

   return router;
};
