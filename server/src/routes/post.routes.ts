import { Router } from "express";
import * as postController from "../controllers/post.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Posts
router.post("/", authenticate, postController.createPost);
router.get("/", authenticate, postController.getFeed);
router.get("/campaign-chats", authenticate, postController.getCampaignChats);
router.get("/:id", postController.getPost);
router.put("/:id", authenticate, postController.updatePost);
router.delete("/:id", authenticate, postController.deletePost);

// Likes
router.post("/:id/like", authenticate, postController.toggleLike);

// Campaigns
router.post("/:id/join", authenticate, postController.joinCampaign);
router.post("/:id/start", authenticate, postController.startCampaign);
router.post("/:id/end", authenticate, postController.endCampaign);

// Comments
router.get("/:id/comments", authenticate, postController.getComments);
router.post("/:id/comments", authenticate, postController.createComment);

// Campaign chat messages
router.get("/chat/:conversationId/messages", authenticate, postController.getMessages);
router.post("/chat/:conversationId/messages", authenticate, postController.sendMessage);

export default router;
