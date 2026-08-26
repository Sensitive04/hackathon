import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import { apiLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/register", apiLimiter, authController.register);
router.post("/login", apiLimiter, authController.login);
router.get("/profile", authenticate, authController.getProfile);
router.put("/profile", authenticate, authController.updateProfile);

export default router;
