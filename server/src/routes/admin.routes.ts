import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/users", adminController.getUsers);
router.delete("/users/:id", adminController.deleteUser);
router.put("/users/:id/role", adminController.updateUserRole);
router.post("/create-admin", adminController.createAdmin);
router.get("/listings", adminController.getListings);
router.delete("/listings/:id", adminController.deleteListing);
router.get("/stats", adminController.getStats);


export default router;
