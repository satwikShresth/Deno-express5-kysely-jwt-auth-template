import { Generated } from 'kysely';
export interface UserTable {
   id: Generated<string>; // UUID
   email: string;
   is_active: boolean;
   is_superuser: boolean;
   full_name: string | null;
   hashed_password: string;
}
