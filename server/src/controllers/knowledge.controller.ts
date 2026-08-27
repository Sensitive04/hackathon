import { Request, Response } from "express";
import { chatWithAI } from "../services/ai.service.js";

export async function handleChat(req: Request, res: Response) {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      res.status(400).json({ error: "Message is required" });
      return;
    }
    const reply = await chatWithAI(message.trim(), history || []);
    res.json({ reply });
  } catch (err: any) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message || "Chat request failed" });
  }
}
