// items.model.ts
import { Static, Type } from '@sinclair/typebox';
import { QuerySkipLimit } from 'models/common.model.ts';

export const Item = Type.Object({
   description: Type.Union([
      Type.String({
         maxLength: 255,
         errorMessage: {
            maxLength: 'Description must be under 255 characters',
         },
      }),
      Type.Null(),
   ]),
   title: Type.String({
      maxLength: 255,
      errorMessage: {
         maxLength: 'Title must be under 255 characters',
      },
   }),
});

export const QueryItem = QuerySkipLimit;
export type QueryItem = Static<typeof QueryItem>;
export type Item = Static<typeof Item>;

