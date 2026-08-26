import { Router } from "express";
import * as satelliteController from "../controllers/satellite.controller.js";
import { authenticate } from "../middleware/auth.js";
import { aiLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post(
  "/analyze",
  authenticate,
  aiLimiter,
  satelliteController.analyzeRegion
);
router.get("/history", authenticate, satelliteController.getHistory);

export default router;
