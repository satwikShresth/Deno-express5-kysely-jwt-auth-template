import type { UserTable } from 'database/types/user.ts';
import type { ItemTable } from 'database/types/item.ts';

export default interface Database {
   user: UserTable;
   item: ItemTable;
}

export type { ItemTable, UserTable };
