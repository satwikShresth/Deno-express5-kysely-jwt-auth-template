import { defineConfig, Config } from 'drizzle-kit';
import { database, host, password, port, user } from '../config/database.ts';

export default defineConfig({
   dialect: 'postgresql',
   out: './database/migrations',
   schema: './database/schema.ts',
   migrations: {
      schema: 'public',
   },
   dbCredentials: { host, database, password, port, user, ssl: false },
   verbose : true,
   strict: true
}) satisfies Config;
