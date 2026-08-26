import { Response } from "express";
import { IAuthRequest } from "../types/index.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

export const getConversations = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { listingId } = req.query;
    const query: any = { participants: req.user!.id };
    if (listingId) query.listingId = listingId;

    const conversations = await Conversation.find(query)
      .populate("participants", "name avatar role")
      .populate({
        path: "listingId",
        select: "title images listingType status sellerId pendingBuyerId",
        populate: { path: "sellerId pendingBuyerId", select: "name avatar" },
      })
      .sort({ lastMessageAt: -1 });

    const result = conversations.map((c) => {
      const other = c.participants.find(
        (p: any) => p._id.toString() !== req.user!.id
      );
      return {
        id: c._id,
        otherUser: other,
        listing: c.listingId,
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt,
      };
    });

    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch conversations" });
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

export const createConversation = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { participantId, listingId } = req.body;
    if (!participantId) {
      res.status(400).json({ error: "participantId is required" });
      return;
    }
    if (participantId === req.user!.id) {
      res.status(400).json({ error: "Cannot create a conversation with yourself" });
      return;
    }

    const existing = await Conversation.findOne({
      participants: { $all: [req.user!.id, participantId] },
      listingId: listingId || null,
    }).populate("participants", "name avatar role");

    if (existing) {
      const other = existing.participants.find(
        (p: any) => p._id.toString() !== req.user!.id
      );
      res.json({
        id: existing._id,
        otherUser: other,
        listing: existing.listingId,
        lastMessage: existing.lastMessage,
        lastMessageAt: existing.lastMessageAt,
      });
      return;
    }

    const conversation = await Conversation.create({
      participants: [req.user!.id, participantId],
      listingId: listingId || undefined,
    });

    const populated = await conversation.populate(
      "participants",
      "name avatar role"
    );
    const other = populated.participants.find(
      (p: any) => p._id.toString() !== req.user!.id
    );

    res.status(201).json({
      id: populated._id,
      otherUser: other,
      listing: populated.listingId,
      lastMessage: "",
      lastMessageAt: populated.lastMessageAt,
    });
  } catch {
    res.status(500).json({ error: "Failed to create conversation" });
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
      res.status(400).json({ error: "Message content is required" });
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

    const message = await Message.create({
      conversationId,
      senderId: req.user!.id,
      content: content.trim(),
    });

    conversation.lastMessage = content.trim().slice(0, 200);
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populated = await message.populate("senderId", "name avatar");

    res.status(201).json(populated);
  } catch {
    res.status(500).json({ error: "Failed to send message" });
  }
};

export const markRead = async (
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

    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: req.user!.id },
        read: false,
      },
      { read: true }
    );
    res.json({ message: "Marked as read" });
  } catch {
    res.status(500).json({ error: "Failed to mark as read" });
  }
};
