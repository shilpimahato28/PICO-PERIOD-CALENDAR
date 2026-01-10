import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  // === USER ===
  app.put(api.user.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.user.update.input.parse(req.body);
      const user = await storage.updateUser(req.user.id, input);
      res.json(user);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        res.sendStatus(500);
      }
    }
  });

  // === LOGS ===
  app.get(api.logs.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const logs = await storage.getLogs(req.user.id);
    res.json(logs);
  });

  app.post(api.logs.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.logs.create.input.parse(req.body);
      const log = await storage.createLog({ ...input, userId: req.user.id });
      res.status(201).json(log);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        res.sendStatus(500);
      }
    }
  });

  app.put(api.logs.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = Number(req.params.id);
    try {
      const input = api.logs.update.input.parse(req.body);
      const log = await storage.updateLog(id, req.user.id, input);
      if (!log) return res.status(404).send({ message: "Log not found" });
      res.json(log);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        res.sendStatus(500);
      }
    }
  });

  app.delete(api.logs.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = Number(req.params.id);
    await storage.deleteLog(id, req.user.id);
    res.sendStatus(204);
  });

  // === ARTICLES ===
  app.get(api.articles.list.path, async (req, res) => {
    const articles = await storage.getArticles();
    res.json(articles);
  });

  app.get(api.articles.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const article = await storage.getArticle(id);
    if (!article) return res.status(404).send({ message: "Article not found" });
    res.json(article);
  });

  // === CHAT ===
  app.get(api.rooms.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const rooms = await storage.getRooms();
    res.json(rooms);
  });

  app.get(api.rooms.messages.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const roomId = Number(req.params.roomId);
    const messages = await storage.getMessages(roomId);
    res.json(messages);
  });

  app.post(api.rooms.messages.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const roomId = Number(req.params.roomId);
    
    // Rate limit check: 1 message per day per room (as per strict req, or maybe per app?)
    // Request said "Each user can send only 1 message per day" -> implying globally or per room?
    // "Create community chat rooms... Each user can send only 1 message per day"
    // I will assume per room for now to be slightly lenient, or globally? Let's do per room.
    const count = await storage.getUserMessageCountForDay(req.user.id, roomId);
    if (count >= 1) {
      return res.status(400).json({ message: "Daily message limit reached (1 message per day)." });
    }

    try {
      const input = api.rooms.messages.create.input.parse(req.body);
      const message = await storage.createMessage({
        roomId,
        userId: req.user.id,
        content: input.content,
        isAnonymous: true // Enforced anonymous
      });
      res.status(201).json(message);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        res.sendStatus(500);
      }
    }
  });

  // === PREDICTIONS (OpenAI) ===
  app.get(api.predictions.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const predictions = await storage.getPredictions(req.user.id);
    res.json(predictions);
  });

  app.post(api.predictions.generate.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Get user logs history
    const logs = await storage.getLogs(req.user.id);
    if (logs.length < 2) {
        return res.status(400).json({ message: "Need at least 2 logs to predict." });
    }

    try {
      // Use OpenAI to predict next date
      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          {
            role: "system",
            content: "You are a health assistant predicting period cycles. Output ONLY a JSON object with 'predictedStartDate' (YYYY-MM-DD) and 'confidence' (0-100). Do not include markdown formatting."
          },
          {
            role: "user",
            content: `Based on these past period logs, predict the next start date: ${JSON.stringify(logs.map(l => ({ start: l.startDate, end: l.endDate })))}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      if (!result.predictedStartDate) {
          throw new Error("Invalid prediction response");
      }

      const prediction = await storage.createPrediction({
        userId: req.user.id,
        predictedStartDate: result.predictedStartDate,
        confidence: result.confidence || 50
      });

      res.status(201).json(prediction);
    } catch (error) {
      console.error("Prediction error:", error);
      res.status(500).json({ message: "Failed to generate prediction" });
    }
  });

  // === SEED DATA ===
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const articles = await storage.getArticles();
  if (articles.length === 0) {
    await storage.createArticle({
      title: "Understanding Your Cycle Phases",
      content: "The menstrual cycle has four phases: menstruation, the follicular phase, ovulation, and the luteal phase...",
      category: "Education",
      imageUrl: "https://images.unsplash.com/photo-1515023115689-589c33041697" // Placeholder
    });
    await storage.createArticle({
      title: "Nutrition for Hormone Balance",
      content: "Eating the right foods during each phase of your cycle can help alleviate symptoms...",
      category: "Wellness",
      imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061" // Placeholder
    });
  }

  const rooms = await storage.getRooms();
  if (rooms.length === 0) {
    await storage.createRoom({
      name: "Wellness Chat",
      description: "General discussion about women's health and wellness."
    });
    await storage.createRoom({
      name: "Cycle Support",
      description: "Support and tips for dealing with period symptoms."
    });
  }
}
