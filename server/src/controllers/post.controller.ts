import { Response } from "express";
import { IAuthRequest } from "../types/index.js";
import Post from "../models/Post.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Comment from "../models/Comment.js";

export const createPost = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { content, images, hashtags, campaignStatus, volunteerNeeded } = req.body;
    if (!content || !content.trim()) {
      res.status(400).json({ error: "Content is required" });
      return;
    }

    const parsedHashtags = Array.isArray(hashtags)
      ? hashtags.map((h: string) => h.toLowerCase().replace(/^#/, "").trim()).filter(Boolean)
      : [];

    const post = await Post.create({
      userId: req.user!.id,
      content: content.trim(),
      images: images || [],
      hashtags: parsedHashtags,
      campaignStatus: campaignStatus || undefined,
      volunteerNeeded: campaignStatus ? Math.min(100, Math.max(1, parseInt(volunteerNeeded) || 1)) : 0,
    });

    const populated = await post.populate("userId", "name avatar");

    const io = (req as any).io;
    if (io) {
      io.emit("post:new", populated);
    }

    res.status(201).json(populated);
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
};

export const getFeed = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const { type, tag } = req.query;

    const filter: any = {};
    if (type === "campaign") {
      filter.campaignStatus = { $in: ["proposed", "started"] };
    } else if (type === "my-campaigns") {
      filter.campaignStatus = { $in: ["proposed", "started"] };
      filter.userId = req.user?.id;
    } else if (type === "ended") {
      filter.campaignStatus = { $in: ["ended", "completed"] };
    }
    if (tag) filter.hashtags = { $in: [String(tag).toLowerCase()] };

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("userId", "name avatar")
        .populate("volunteers", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(filter),
    ]);

    res.json({ posts, hasMore: page * limit < total });
  } catch (error) {
    console.error("Get feed error:", error);
    res.status(500).json({ error: "Failed to fetch feed" });
  }
};

export const getPost = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("userId", "name avatar")
      .populate("volunteers", "name avatar");
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    res.json(post);
  } catch {
    res.status(500).json({ error: "Failed to fetch post" });
  }
};

export const updatePost = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    if (post.userId.toString() !== req.user!.id) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    const { content, hashtags, images, campaignStatus } = req.body;
    if (content !== undefined) post.content = content.trim();
    if (hashtags !== undefined) {
      post.hashtags = Array.isArray(hashtags)
        ? hashtags.map((h: string) => h.toLowerCase().replace(/^#/, "").trim()).filter(Boolean)
        : [];
    }
    if (images !== undefined) post.images = images;
    if (campaignStatus !== undefined) post.campaignStatus = campaignStatus;
    await post.save();

    const populated = await post.populate("userId", "name avatar");

    const io = (req as any).io;
    if (io) {
      io.emit("post:update", populated);
    }

    res.json(populated);
  } catch {
    res.status(500).json({ error: "Failed to update post" });
  }
};

export const deletePost = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    if (post.userId.toString() !== req.user!.id && req.user!.role !== "admin") {
      res.status(403).json({ error: "Not authorized" });
      return;
    }
    await Post.findByIdAndDelete(req.params.id);

    const io = (req as any).io;
    if (io) {
      io.emit("post:delete", { postId: req.params.id });
    }

    res.json({ message: "Post deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete post" });
  }
};

export const toggleLike = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const userId = req.user!.id;
    const idx = post.likes.findIndex((id) => id.toString() === userId);
    if (idx >= 0) {
      post.likes.splice(idx, 1);
    } else {
      post.likes.push(userId as any);
    }
    await post.save();

    const io = (req as any).io;
    if (io) {
      io.emit("post:like", {
        postId: post._id.toString(),
        likes: post.likes.map((id) => id.toString()),
      });
    }

    res.json({ likes: post.likes });
  } catch {
    res.status(500).json({ error: "Failed to toggle like" });
  }
};

export const joinCampaign = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    if (!post.campaignStatus) {
      res.status(400).json({ error: "Not a campaign post" });
      return;
    }

    const userId = req.user!.id;
    const alreadyJoined = post.volunteers.some((v) => v.toString() === userId);
    if (alreadyJoined) {
      res.status(400).json({ error: "Already joined" });
      return;
    }

    if (post.volunteerNeeded > 0 && post.volunteers.length >= post.volunteerNeeded) {
      res.status(400).json({ error: "Campaign is full" });
      return;
    }

    post.volunteers.push(userId as any);
    await post.save();

    const populated = await post.populate("volunteers", "name avatar");
    res.json({ volunteers: populated.volunteers, volunteerNeeded: populated.volunteerNeeded });
  } catch {
    res.status(500).json({ error: "Failed to join campaign" });
  }
};

export const startCampaign = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    if (post.userId.toString() !== req.user!.id) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }
    if (post.campaignStatus !== "proposed") {
      res.status(400).json({ error: "Campaign cannot be started" });
      return;
    }

    post.campaignStatus = "started";

    const participantIds = [
      post.userId.toString(),
      ...post.volunteers.map((v) => v.toString()),
    ];
    const uniqueParticipants = [...new Set(participantIds)];

    const conversation = await Conversation.create({
      participants: uniqueParticipants,
      postId: post._id,
      title: post.content.slice(0, 80),
    });

    post.conversationId = conversation._id;
    await post.save();

    const populated = await conversation.populate("participants", "name avatar role");
    const populatedPost = await post.populate("userId", "name avatar");

    const io = (req as any).io;
    if (io) {
      for (const pid of uniqueParticipants) {
        io.to(`user:${pid}`).emit("campaign:group-created", { conversation: populated });
      }
    }

    res.json({ post: populatedPost, conversation: populated });
  } catch {
    res.status(500).json({ error: "Failed to start campaign" });
  }
};

export const endCampaign = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    if (post.userId.toString() !== req.user!.id) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }
    if (post.campaignStatus !== "started") {
      res.status(400).json({ error: "Only active campaigns can be ended" });
      return;
    }

    post.campaignStatus = "ended";
    await post.save();

    if (post.conversationId) {
      const senderId = post.userId;
      const systemMessage = await Message.create({
        conversationId: post.conversationId,
        senderId,
        content: "This campaign has ended",
        isSystem: true,
      });

      const conversation = await Conversation.findById(post.conversationId);
      if (conversation) {
        conversation.lastMessage = "This campaign has ended";
        conversation.lastMessageAt = new Date();
        await conversation.save();

        const io = (req as any).io;
        if (io) {
          const populatedSystemMsg = await systemMessage.populate("senderId", "name avatar");
          io.to(post.conversationId.toString()).emit("chat:message", {
            conversationId: post.conversationId.toString(),
            message: populatedSystemMsg,
          });
        }
      }
    }

    const populatedPost = await post.populate("userId", "name avatar");

    const io = (req as any).io;
    if (io) {
      io.emit("post:update", populatedPost);
      io.emit("campaign:ended", {
        postId: post._id.toString(),
        conversationId: post.conversationId?.toString(),
      });
    }

    res.json({ post: populatedPost });
  } catch {
    res.status(500).json({ error: "Failed to end campaign" });
  }
};

export const getCampaignChats = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const conversations = await Conversation.find({
      postId: { $exists: true, $ne: null },
      participants: req.user!.id,
    })
      .populate("participants", "name avatar role")
      .populate("postId", "content campaignStatus")
      .sort({ lastMessageAt: -1 });

    const result = conversations.map((c) => ({
      _id: c._id,
      title: c.title || c.participants.map((p: any) => p.name).join(", "),
      participants: c.participants,
      postId: c.postId,
      lastMessage: c.lastMessage,
      lastMessageAt: c.lastMessageAt,
    }));

    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch campaign chats" });
  }
};

export const sendMessage = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ error: "Content is required" });
      return;
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    if (!conversation.participants.includes(req.user!.id as any)) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    if (conversation.postId) {
      const post = await Post.findById(conversation.postId);
      if (post && post.campaignStatus === "ended") {
        res.status(400).json({ error: "This campaign has ended. Messaging is disabled." });
        return;
      }
    }

    const message = await Message.create({
      conversationId,
      senderId: req.user!.id,
      content: content.trim(),
    });

    conversation.lastMessage = content.trim().slice(0, 200);
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populated = await message.populate("senderId", "name avatar");

    const io = (req as any).io;
    if (io) {
      io.to(conversationId).emit("chat:message", {
        conversationId,
        message: populated,
      });
    }

    res.status(201).json(populated);
  } catch {
    res.status(500).json({ error: "Failed to send message" });
  }
};

export const getMessages = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    if (!conversation.participants.includes(req.user!.id as any)) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const messages = await Message.find({ conversationId })
      .populate("senderId", "name avatar")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const getComments = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const comments = await Comment.find({ postId: req.params.id })
      .populate("userId", "name avatar")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

export const createComment = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      res.status(400).json({ error: "Comment text is required" });
      return;
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const comment = await Comment.create({
      text: text.trim(),
      postId: req.params.id,
      userId: req.user!.id,
    });

    const populated = await comment.populate("userId", "name avatar");
    res.status(201).json(populated);
  } catch {
    res.status(500).json({ error: "Failed to create comment" });
  }
};
