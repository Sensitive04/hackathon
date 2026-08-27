import { Router } from "express";
import * as messageController from "../controllers/message.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/conversations", messageController.getConversations);
router.post("/conversations", messageController.createConversation);
router.get("/:conversationId", messageController.getMessages);
router.post("/:conversationId", messageController.sendMessage);
router.put("/:conversationId/read", messageController.markRead);
router.delete("/:conversationId", messageController.deleteConversation);

export default router;
