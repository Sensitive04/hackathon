import { Router } from "express";
import * as marketplaceController from "../controllers/marketplace.controller.js";
import { authenticate } from "../middleware/auth.js";
import { aiLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post(
  "/analyze",
  authenticate,
  aiLimiter,
  marketplaceController.analyzeItem
);
router.post("/list", authenticate, marketplaceController.listItem);
router.get("/", marketplaceController.getMarketplace);
router.get("/my-listings", authenticate, marketplaceController.getMyListings);
router.get("/:id", marketplaceController.getItem);
router.post("/:id/purchase", authenticate, marketplaceController.purchaseItem);

export default router;
