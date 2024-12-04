import { QuerySkipLimit } from 'models/common.model.ts';
import { z } from 'zod';

export const Item = z.object({
   description: z
      .string()
      .max(255, { message: 'Description must be under 255 characters' })
      .nullable(),
   title: z
      .string()
      .max(255, { message: 'Title must be under 255 characters' }),
}).refine(
   (data) => {
      if (data.description && data.title.length >= data.description.length) {
         return false;
      }
      return true;
   },
   { message: 'Title must be shorter than description' },
);
// QueryItem Schema
export const QueryItem = QuerySkipLimit;

//types
export type QueryItem = z.infer<typeof QueryItem>;
export type Item = z.infer<typeof Item>;
