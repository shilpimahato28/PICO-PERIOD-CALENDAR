import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === USERS ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  age: integer("age"),
  cycleLength: integer("cycle_length").default(28),
  healthPreferences: text("health_preferences"), // JSON string or text
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  age: true,
  cycleLength: true,
  healthPreferences: true,
});

// === PERIOD LOGS ===
export const periodLogs = pgTable("period_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Foreign key relation defined below
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  flowIntensity: text("flow_intensity"), // light, medium, heavy
  symptoms: text("symptoms"), // JSON array of strings
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPeriodLogSchema = createInsertSchema(periodLogs).omit({ 
  id: true, 
  createdAt: true 
});

// === PREDICTIONS ===
export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  predictedStartDate: date("predicted_start_date").notNull(),
  confidence: integer("confidence"), // 0-100
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
  createdAt: true
});

// === ARTICLES ===
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true
});

// === CHAT ROOMS ===
export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  createdAt: true
});

// === MESSAGES ===
export const messages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  isAnonymous: boolean("is_anonymous").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true
});

// === RELATIONS ===
export const usersRelations = relations(users, ({ many }) => ({
  logs: many(periodLogs),
  predictions: many(predictions),
  messages: many(messages),
}));

export const logsRelations = relations(periodLogs, ({ one }) => ({
  user: one(users, {
    fields: [periodLogs.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
  room: one(rooms, {
    fields: [messages.roomId],
    references: [rooms.id],
  }),
}));

// === TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type PeriodLog = typeof periodLogs.$inferSelect;
export type InsertPeriodLog = z.infer<typeof insertPeriodLogSchema>;

export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;

export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;

export type ChatMessage = typeof messages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
