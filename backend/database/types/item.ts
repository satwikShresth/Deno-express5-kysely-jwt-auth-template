import { Generated } from 'kysely';
export interface ItemTable {
   id: Generated<string>;
   title: string;
   description: string | null;
   owner_id: string;
}
