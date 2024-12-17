import { count, eq } from 'drizzle-orm';
import { db } from 'db';
import { Item, items } from 'db/types';

interface ItemUpdate {
   title?: string;
   description?: string;
}

class ItemService {
   async getItems(skip: number, limit: number, user_id: string) {
      const result = await db
         .select()
         .from(items)
         .where(eq(items.owner_id, user_id))
         .limit(limit)
         .offset(skip);

      return result;
   }

   async getItemCount(user_id?: string) {
      return await db
         .select({ value: count(items.id) })
         .from(items)
         .where(user_id ? eq(items.owner_id, user_id) : undefined)
         .then((result) => result[0].value);
   }

   async getItemById(id: string): Promise<Item | undefined> {
      const result = await db
         .select()
         .from(items)
         .where(eq(items.id, id))
         .limit(1);

      return result[0];
   }

   async createItem(
      title: string,
      description: string | null,
      owner_id: string,
   ): Promise<Item> {
      const result = await db
         .insert(items)
         .values({
            title,
            description,
            owner_id,
         })
         .returning();

      return result[0];
   }

   async updateItem(id: string, data: ItemUpdate): Promise<Item | undefined> {
      const result = await db
         .update(items)
         .set(data)
         .where(eq(items.id, id))
         .returning();

      return result[0];
   }

   async deleteItem(id: string): Promise<void> {
      await db
         .delete(items)
         .where(eq(items.id, id));
   }
}

export const itemService = new ItemService();
