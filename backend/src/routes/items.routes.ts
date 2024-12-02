import { Response, Router } from 'express';
import { AuthRequest } from 'app/types';
import { db } from 'db';
import { ItemUpdate, User } from 'db/types';

interface QueryAuthRequest extends AuthRequest {
   query: {
      skip?: number;
      limit?: number;
   };
   params: { id: string };
   body: { title?: string; description?: string };
}

const controllers = {
   getQueryItem: async (req: QueryAuthRequest, res: Response) => {
      const { skip = 0, limit = 100 } = req.query;
      const user = req.user as User;

      let query = db.selectFrom('item').selectAll();
      let countQuery = db.selectFrom('item').select(
         db.fn.count('id').as('count'),
      );

      if (!user.is_superuser) {
         query = query.where('owner_id', '=', user.id);
         countQuery = countQuery.where('owner_id', '=', user.id);
      }

      const items = await query
         .limit(Number(limit))
         .offset(Number(skip))
         .execute();

      const count = await countQuery.executeTakeFirst();

      res.json({ data: items, count: Number(count?.count || 0) });
   },

   getQueryItemById: async (req: QueryAuthRequest, res: Response) => {
      const { id } = req.params;
      const user = req.user as User;

      const item = await db
         .selectFrom('item')
         .selectAll()
         .where('id', '=', id)
         .executeTakeFirst();

      if (!item) {
         return res.status(404).json({ detail: 'Item not found' });
      }

      if (!user.is_superuser && item.owner_id !== user.id) {
         return res.status(403).json({ detail: 'Not enough permissions' });
      }

      res.json(item);
   },

   postQueryItem: async (req: QueryAuthRequest, res: Response) => {
      const { title, description } = req.body;
      const owner_id = req.user.id;

      const newItem = await db
         .insertInto('item')
         .values({ title, description, owner_id })
         .returningAll()
         .executeTakeFirst();

      res.status(201).json(newItem);
   },

   putQueryItembyId: async (req: QueryAuthRequest, res: Response) => {
      const { id } = req.params;
      const itemData: ItemUpdate = req.body;
      const user = req.user as User;

      const item = await db
         .selectFrom('item')
         .selectAll()
         .where('id', '=', id)
         .executeTakeFirst();

      if (!item) {
         return res.status(404).json({ detail: 'Item not found' });
      }

      if (!user.is_superuser && item.owner_id !== user.id) {
         return res.status(403).json({ detail: 'Not enough permissions' });
      }

      const updatedItem = await db
         .updateTable('item')
         .set(itemData)
         .where('id', '=', id)
         .returningAll()
         .executeTakeFirst();

      res.json(updatedItem);
   },

   deleteQueryItemById: async (req: QueryAuthRequest, res: Response) => {
      const { id } = req.params;
      const user = req.user as User;

      const item = await db
         .selectFrom('item')
         .selectAll()
         .where('id', '=', id)
         .executeTakeFirst();

      if (!item) {
         return res.status(404).json({ detail: 'Item not found' });
      }

      if (!user.is_superuser && item.owner_id !== user.id) {
         return res.status(403).json({ detail: 'Not enough permissions' });
      }

      await db
         .deleteFrom('item')
         .where('id', '=', id)
         .execute();

      res.json({ message: 'Item deleted successfully' });
   },
};

export default () => {
   const router = Router();

   router.route('/')
      .get(controllers.getQueryItem)
      .post(controllers.postQueryItem);

   router.route('/:id')
      .get(controllers.getQueryItemById)
      .put(controllers.putQueryItembyId)
      .delete(controllers.deleteQueryItemById);

   return router;
};
