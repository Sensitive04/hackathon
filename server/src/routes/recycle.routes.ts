import { Router } from "express";
import * as recycleController from "../controllers/recycle.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/pending", authorize("admin", "recycler"), recycleController.getPendingPickups);
router.post("/:listingId/claim", authorize("admin", "recycler"), recycleController.claimPickup);
router.put("/:id/status", authorize("admin", "recycler"), recycleController.updatePickupStatus);
router.get("/my-pickups", authorize("admin", "recycler"), recycleController.getMyPickups);
router.get("/my-requests", recycleController.getMyRequests);

export default router;
