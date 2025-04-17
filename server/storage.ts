import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg"; // Import the default export
const { Pool } = pg; // Destructure Pool from the default export
import { eq } from "drizzle-orm";
import {
  users,
  documents,
  reminders,
  type User,
  type InsertUser,
  type Document,
  type InsertDocument,
  type Reminder,
  type InsertReminder,
} from "@shared/schema";

// Ensure SUPABASE_DB_URL is set
if (!process.env.SUPABASE_DB_URL) {
  throw new Error("SUPABASE_DB_URL is not set in environment variables");
}

// Initialize PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
});

// Initialize Drizzle ORM
const db = drizzle(pool);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByUserId(userId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocumentAnalysis(
    id: number,
    data: {
      summary?: string;
      actionItems?: any[];
      tags?: string[];
      status?: string;
    }
  ): Promise<Document | undefined>;
  getReminder(id: number): Promise<Reminder | undefined>;
  getRemindersByUserId(userId: number): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, data: Partial<Reminder>): Promise<Reminder | undefined>;
}

export class SupabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
    return result[0];
  }

  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    return db.select().from(documents).where(eq(documents.userId, userId));
  }

  async createDocument(documentData: InsertDocument): Promise<Document> {
    const result = await db
      .insert(documents)
      .values({
        ...documentData,
        uploadedAt: new Date(),
      })
      .returning();
    return result[0];
  }

  async updateDocumentAnalysis(
    id: number,
    data: {
      summary?: string;
      actionItems?: any[];
      tags?: string[];
      status?: string;
    }
  ): Promise<Document | undefined> {
    const updates: Partial<Document> = {};
    if (data.summary !== undefined) updates.summary = data.summary;
    if (data.actionItems !== undefined) updates.actionItems = data.actionItems;
    if (data.tags !== undefined) updates.tags = data.tags;
    if (data.status !== undefined) updates.status = data.status;

    const result = await db
      .update(documents)
      .set(updates)
      .where(eq(documents.id, id))
      .returning();
    return result[0];
  }

  async getReminder(id: number): Promise<Reminder | undefined> {
    const result = await db.select().from(reminders).where(eq(reminders.id, id)).limit(1);
    return result[0];
  }

  async getRemindersByUserId(userId: number): Promise<Reminder[]> {
    return db.select().from(reminders).where(eq(reminders.userId, userId));
  }

  async createReminder(reminderData: InsertReminder): Promise<Reminder> {
    const result = await db.insert(reminders).values(reminderData).returning();
    return result[0];
  }

  async updateReminder(id: number, data: Partial<Reminder>): Promise<Reminder | undefined> {
    const result = await db
      .update(reminders)
      .set(data)
      .where(eq(reminders.id, id))
      .returning();
    return result[0];
  }
}

export const storage = new SupabaseStorage();

// Cleanup pool on process exit
process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});