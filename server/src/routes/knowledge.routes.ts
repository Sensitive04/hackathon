import { Router } from "express";
import { handleChat } from "../controllers/knowledge.controller.js";
import { aiLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/chat", aiLimiter, handleChat);

export default router;
