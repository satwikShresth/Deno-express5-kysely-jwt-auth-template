import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import {
   database,
   host,
   max,
   min,
   password,
   port,
   user,
} from 'config/database.ts';
import * as schema from './schema.ts';

const client = new pg.Pool({ host, database, port, user, password, min, max });
const casing = 'snake_case';

export const db = drizzle({ client, schema, casing });
