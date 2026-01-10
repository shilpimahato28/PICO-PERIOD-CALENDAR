import { users, periodLogs, articles, rooms, messages, predictions, type User, type InsertUser, type PeriodLog, type InsertPeriodLog, type Article, type InsertArticle, type Room, type InsertRoom, type ChatMessage, type InsertChatMessage, type Prediction, type InsertPrediction } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  
  // Logs
  getLogs(userId: number): Promise<PeriodLog[]>;
  createLog(log: InsertPeriodLog): Promise<PeriodLog>;
  updateLog(id: number, userId: number, updates: Partial<InsertPeriodLog>): Promise<PeriodLog | undefined>;
  deleteLog(id: number, userId: number): Promise<void>;

  // Predictions
  getPredictions(userId: number): Promise<Prediction[]>;
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;

  // Articles
  getArticles(): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;

  // Chat
  getRooms(): Promise<Room[]>;
  createRoom(room: InsertRoom): Promise<Room>;
  getMessages(roomId: number): Promise<ChatMessage[]>;
  createMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getUserMessageCountForDay(userId: number, roomId: number): Promise<number>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // Auth
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  // Logs
  async getLogs(userId: number): Promise<PeriodLog[]> {
    return await db.select().from(periodLogs).where(eq(periodLogs.userId, userId)).orderBy(desc(periodLogs.startDate));
  }

  async createLog(log: InsertPeriodLog): Promise<PeriodLog> {
    const [newLog] = await db.insert(periodLogs).values(log).returning();
    return newLog;
  }

  async updateLog(id: number, userId: number, updates: Partial<InsertPeriodLog>): Promise<PeriodLog | undefined> {
    const [updatedLog] = await db
      .update(periodLogs)
      .set(updates)
      .where(and(eq(periodLogs.id, id), eq(periodLogs.userId, userId)))
      .returning();
    return updatedLog;
  }

  async deleteLog(id: number, userId: number): Promise<void> {
    await db.delete(periodLogs).where(and(eq(periodLogs.id, id), eq(periodLogs.userId, userId)));
  }

  // Predictions
  async getPredictions(userId: number): Promise<Prediction[]> {
    return await db.select().from(predictions).where(eq(predictions.userId, userId)).orderBy(desc(predictions.predictedStartDate));
  }

  async createPrediction(prediction: InsertPrediction): Promise<Prediction> {
    const [newPrediction] = await db.insert(predictions).values(prediction).returning();
    return newPrediction;
  }

  // Articles
  async getArticles(): Promise<Article[]> {
    return await db.select().from(articles).orderBy(desc(articles.createdAt));
  }

  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const [newArticle] = await db.insert(articles).values(article).returning();
    return newArticle;
  }

  // Chat
  async getRooms(): Promise<Room[]> {
    return await db.select().from(rooms).orderBy(rooms.name);
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const [newRoom] = await db.insert(rooms).values(room).returning();
    return newRoom;
  }

  async getMessages(roomId: number): Promise<ChatMessage[]> {
    return await db.select().from(messages).where(eq(messages.roomId, roomId)).orderBy(messages.createdAt);
  }

  async createMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getUserMessageCountForDay(userId: number, roomId: number): Promise<number> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // This is a rough check, ideally use SQL date functions for DB time
    const [count] = await db.select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(and(
        eq(messages.userId, userId),
        eq(messages.roomId, roomId),
        sql`${messages.createdAt} >= ${startOfDay.toISOString()}`
      ));
      
    return Number(count.count);
  }
}

export const storage = new DatabaseStorage();
