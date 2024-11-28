// migrations/20241127_initial_schema.ts
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
   await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);

   // Create user table
   await db.schema
      .createTable('user')
      .addColumn(
         'id',
         'uuid',
         (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
      )
      .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
      .addColumn('is_active', 'boolean', (col) => col.notNull())
      .addColumn('is_superuser', 'boolean', (col) => col.notNull())
      .addColumn('full_name', 'varchar(255)')
      .addColumn('hashed_password', 'varchar', (col) => col.notNull())
      .execute();

   await db.schema
      .createTable('item')
      .addColumn(
         'id',
         'uuid',
         (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
      )
      .addColumn('title', 'varchar(255)', (col) => col.notNull())
      .addColumn('description', 'varchar(255)')
      .addColumn('owner_id', 'uuid', (col) =>
         col.notNull()
            .references('user.id')
            .onDelete('cascade'))
      .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
   await db.schema.dropTable('item').execute();
   await db.schema.dropTable('user').execute();

   await sql`DROP EXTENSION IF EXISTS "uuid-ossp"`.execute(db);
}

