import { db } from 'db';
import { ItemUpdate } from 'db/types';

class ItemService {
   async getItems(skip: number, limit: number, userId: string) {
      return await db
         .selectFrom('item')
         .where('owner_id', '=', userId)
         .selectAll()
         .limit(limit)
         .offset(skip)
         .execute();
   }

   async getItemCount(userId?: string) {
      let query = db
         .selectFrom('item')
         .select(db.fn.count('id').as('count'));

      if (userId) {
         query = query.where('owner_id', '=', userId);
      }

      const count = await query.executeTakeFirst();
      return Number(count?.count || 0);
   }

   async getItemById(id: string) {
      return await db
         .selectFrom('item')
         .selectAll()
         .where('id', '=', id)
         .executeTakeFirst();
   }

   async createItem(
      title: string,
      description: string | null,
      ownerId: string,
   ) {
      return await db
         .insertInto('item')
         .values({ title, description, owner_id: ownerId })
         .returningAll()
         .executeTakeFirst();
   }

   async updateItem(id: string, data: ItemUpdate) {
      return await db
         .updateTable('item')
         .set(data)
         .where('id', '=', id)
         .returningAll()
         .executeTakeFirst();
   }

   async deleteItem(id: string) {
      return await db
         .deleteFrom('item')
         .where('id', '=', id)
         .execute();
   }
}

export const itemService = new ItemService();
