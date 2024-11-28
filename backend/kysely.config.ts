import { Kysely, PostgresDialect } from 'kysely';
import { defineConfig } from 'kysely-ctl';
import { Pool } from 'pg';
import Database from 'db/types';

const database = Deno.env.get('POSTGRES_DB');
const port = Deno.env.get('POSTGRES_PORT');
const user = Deno.env.get('POSTGRES_USER');
const password = Deno.env.get('POSTGRES_PASSWORD');
const host = Deno.env.get('POSTGRES_SERVER');
const min = 2;
const max = 10;

const pool = () =>
   new Pool({
      host: Deno.env.get('ENV') ? host : 'localhost',
      database,
      port,
      user,
      password,
      min,
      max,
   });

const dialect = new PostgresDialect({ pool });

export default defineConfig({
   dialect,
   migrations: {
      migrationFolder: 'database/migrations',
   },
   seeds: {
      seedFolder: 'database/seeds',
   },
});

export const db = new Kysely<Database>({
   dialect,
});
