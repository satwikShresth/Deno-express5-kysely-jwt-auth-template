import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface ItemTable {
   id: Generated<string>;
   title: string;
   description: string | null;
   owner_id: string;
}

export type Item = Selectable<ItemTable>;
export type NewItem = Insertable<ItemTable>;
export type ItemUpdate = Updateable<ItemTable>;
