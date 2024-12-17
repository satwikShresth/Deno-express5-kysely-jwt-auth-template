import { boolean, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('user', {
   id: uuid('id').primaryKey().defaultRandom(),
   email: varchar('email', { length: 255 }).notNull().unique(),
   is_active: boolean('is_active').notNull(),
   is_superuser: boolean('is_superuser').notNull(),
   full_name: varchar('full_name', { length: 255 }),
   hashed_password: varchar('hashed_password').notNull(),
});

export const items = pgTable('item', {
   id: uuid('id').primaryKey().defaultRandom(),
   title: varchar('title', { length: 255 }).notNull(),
   description: varchar('description', { length: 255 }),
   owner_id: uuid('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
});

// Define relations between tables
export const usersRelations = relations(users, ({ many }) => ({
   items: many(items),
}));

export const itemsRelations = relations(items, ({ one }) => ({
   owner: one(users, {
      fields: [items.owner_id],
      references: [users.id],
   }),
}));

export type UserSchema = typeof users.$inferSelect;
export type ItemSchema = typeof items.$inferSelect;
