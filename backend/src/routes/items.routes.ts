// @ts-nocheck because I dont want them yelling at me
import { Item, QueryItem } from 'models/items.model.ts';
import { User, UserId } from 'models/users.model.ts';
import { tbValidator } from '@hono/typebox-validator';
import { Context, Hono } from '@hono/hono';
import { itemService } from 'services/item.service.ts';
import { HTTPException } from '@hono/hono/http-exception';

export default () =>
   new Hono()
      .get(
         '/',
         tbValidator('query', QueryItem),
         async (ctx: Context) => {
            // @ts-expect-error not typed well
            const { skip = 0, limit = 100 } = ctx.req.valid('query');
            const user = await ctx.get('user') as User;

            const items = await itemService.getItems(
               skip,
               limit,
               user.id,
            );
            const count = await itemService.getItemCount(user.id);

            return ctx.json({ data: items, count });
         },
      )
      .post(
         '/',
         tbValidator('json', Item),
         async (ctx: Context) => {
            // @ts-expect-error not typed well
            const { title, description }: Item = ctx.req.valid('json');
            const user = await ctx.get('user') as User;

            const newItem = await itemService.createItem(
               title,
               description,
               user.id,
            );

            return ctx.json(newItem);
         },
      )
      .get(
         '/:id',
         tbValidator('param', UserId),
         async (ctx: Context) => {
            const { id }: UserId = ctx.req.valid('param');
            const user = await ctx.get('user') as User;

            const item = await itemService.getItemById(id);

            if (!item) {
               throw new HTTPException(404, {
                  message: 'Item not found',
               });
            }

            if (!user.is_superuser && item.owner_id !== user.id) {
               throw new HTTPException(404, {
                  message: 'Not enough permissions',
               });
            }

            return ctx.json(item);
         },
      )
      .put(
         '/:id',
         tbValidator('param', UserId),
         tbValidator('json', Item),
         async (ctx: Context) => {
            // @ts-expect-error not typed well
            const { id }: UserId = ctx.req.valid('param');
            const user = await ctx.get('user') as User;
            // @ts-expect-error not typed well
            const itemData: Item = ctx.req.valid('json');

            const item = await itemService.getItemById(id);

            if (!item) {
               throw new HTTPException(404, {
                  message: 'Item not found',
               });
            }

            if (!user.is_superuser && item.owner_id !== user.id) {
               throw new HTTPException(403, {
                  message: 'Not enough permissions',
               });
            }

            const updatedItem = await itemService.updateItem(id, itemData);

            return ctx.json(updatedItem);
         },
      )
      .delete(
         '/:id',
         tbValidator('param', UserId),
         async (ctx: Context) => {
            const { id }: UserId = ctx.req.valid('param');
            const user = await ctx.get('user') as User;

            const item = await itemService.getItemById(id);

            if (!item) {
               throw new HTTPException(404, {
                  message: 'Item not found',
               });
            }

            if (!user.is_superuser && item.owner_id !== user.id) {
               throw new HTTPException(403, {
                  message: 'Not enough permissions',
               });
            }

            await itemService.deleteItem(id);

            return ctx.json({ message: 'Item deleted successfully' });
         },
      );
