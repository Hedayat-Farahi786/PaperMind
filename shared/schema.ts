// shared/schema.ts
import {
  pgTable,
  text,
  serial, // We'll keep serial for document/reminder IDs, only users get UUIDs from Supabase Auth
  integer, // This will be replaced for userId columns
  boolean,
  timestamp,
  jsonb,
  uuid, // Import uuid type
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  // Supabase Auth uses UUIDs for user IDs
  id: uuid("id").primaryKey().notNull(), // Changed from serial to uuid and added notNull // We might still store username, name, email here, // but the primary source and authentication will be Supabase Auth. // Password is NOT stored here when using Supabase Auth, only in Supabase's system. // username: text("username").notNull().unique(), // Username might be optional depending on Supabase setup (e.g., using email/password) // password: text("password").notNull(), // REMOVE: Supabase Auth handles passwords
  name: text("name"), // Optional profile fields // email: text("email").notNull().unique(), // Email is primary identifier in Supabase Auth
  preferences: jsonb("preferences"), // Add created_at/updated_at if needed, Supabase Auth also provides these
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(), // Keep serial for table's own ID // userId must now reference the UUID from the users table
  userId: uuid("user_id") // Changed from integer to uuid
    .references(() => users.id, { onDelete: "cascade" }) // Added onDelete cascade
    .notNull(), // userId should be required
  title: text("title").notNull(),
  originalFilename: text("original_filename").notNull(),
  fileType: text("file_type").notNull(), // filePath will now store the Supabase Storage path
  filePath: text("file_path").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  summary: text("summary"),
  actionItems: jsonb("action_items"),
  tags: text("tags").array(),
  status: text("status").notNull().default("pending"),
});

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(), // Keep serial for table's own ID // userId must now reference the UUID from the users table
  userId: uuid("user_id") // Changed from integer to uuid
    .references(() => users.id, { onDelete: "cascade" }) // Added onDelete cascade
    .notNull(), // userId should be required
  documentId: integer("document_id").references(() => documents.id, {
    onDelete: "cascade",
  }), // Keep integer, references document ID
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  completed: boolean("completed").default(false).notNull(),
  priority: text("priority").default("medium"), // Consider using pgEnum for priority
});

// Zod schemas need adjustment based on the changes
// We remove password from insertUserSchema as Supabase Auth handles it
// We add userId (UUID) to insertDocumentSchema and insertReminderSchema
export const insertUserSchema = createInsertSchema(users).pick({
  // We'll focus on the profile fields stored in our 'users' table.
  // Supabase Auth handles the email/password for the 'auth.users' table.
  // The user ID from auth.users will be used as the PK here.
  name: true, // Add email if you want to potentially sync it, but Supabase Auth is the source of truth // email: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  title: true,
  originalFilename: true,
  fileType: true,
  filePath: true,
  userId: true, // This will be a UUID string from the frontend/auth context
});

export const insertReminderSchema = createInsertSchema(reminders).pick({
  userId: true, // This will be a UUID string from the frontend/auth context
  documentId: true,
  title: true,
  description: true,
  dueDate: true,
  priority: true,
});

// Update types to use uuid for user-related IDs
export type InsertUser = z.infer<typeof insertUserSchema>;
// The User type will reflect the Drizzle schema with UUID id
export type User = typeof users.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
// The Document type will reflect the Drizzle schema with UUID userId
export type Document = typeof documents.$inferSelect;

export type InsertReminder = z.infer<typeof insertReminderSchema>;
// The Reminder type will reflect the Drizzle schema with UUID userId
export type Reminder = typeof reminders.$inferSelect;
