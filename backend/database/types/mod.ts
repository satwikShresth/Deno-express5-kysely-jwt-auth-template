import { UserTable } from 'database/types/user.ts';
import type { NewUser, User, UserUpdate } from 'database/types/user.ts';
import { ItemTable } from 'database/types/item.ts';
import type { Item, ItemUpdate, NewItem } from 'database/types/item.ts';

export default interface Database {
   user: UserTable;
   item: ItemTable;
}

export type { Item, ItemUpdate, NewItem, NewUser, User, UserUpdate };
