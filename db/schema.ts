// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const greetings=sqliteTable('greetings',{id:text('id').primaryKey(),payload:text('payload').notNull(),deleteHash:text('delete_hash').notNull(),createdAt:integer('created_at').notNull(),reports:integer('reports').default(0).notNull()});
export const events=sqliteTable('events',{id:integer('id').primaryKey({autoIncrement:true}),action:text('action').notNull(),templateId:text('template_id').notNull(),createdAt:integer('created_at').notNull()});
export const published=sqliteTable('published',{id:text('id').primaryKey(),enabled:integer('enabled').notNull().default(1)});
