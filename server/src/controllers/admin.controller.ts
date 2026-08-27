import { Response } from "express";
import { IAuthRequest } from "../types/index.js";
import User from "../models/User.js";
import Marketplace from "../models/Marketplace.js";
import Post from "../models/Post.js";

export const getUsers = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    res.json({
      users: users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const deleteUser = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        res.status(400).json({ error: "Cannot delete the last admin" });
        return;
      }
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete user" });
  }
};



export const updateUserRole = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      res.status(400).json({ error: "Invalid role" });
      return;
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (user.role === "admin" && role !== "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        res.status(400).json({ error: "Cannot demote the last admin" });
        return;
      }
    }
    user.role = role;
    await user.save();
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch {
    res.status(500).json({ error: "Failed to update role" });
  }
};

export const createAdmin = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
    const user = await User.create({ name, email, password, role: "admin" });
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch {
    res.status(500).json({ error: "Failed to create admin" });
  }
};

export const getListings = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const { listingType } = req.query;

    const filter: any = {};
    if (listingType) filter.listingType = listingType;

    const [items, total] = await Promise.all([
      Marketplace.find(filter)
        .populate("sellerId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Marketplace.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch listings" });
  }
};

export const deleteListing = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const item = await Marketplace.findByIdAndDelete(req.params.id);
    if (!item) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }
    res.json({ message: "Listing deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete listing" });
  }
};

export const getStats = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const [
      totalUsers,
      adminCount,
      userCount,
      totalListings,
      activeListings,
      soldListings,
      recycledListings,
      recycleListings,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "user" }),
      Marketplace.countDocuments(),
      Marketplace.countDocuments({ status: "available" }),
      Marketplace.countDocuments({ status: "sold" }),
      Marketplace.countDocuments({ status: "recycled" }),
      Marketplace.countDocuments({ listingType: "recycle" }),
    ]);

    res.json({
      totalUsers,
      adminCount,
      userCount,
      totalListings,
      activeListings,
      soldListings,
      recycledListings,
      recycleListings,
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

export const getPosts = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const { type } = req.query;

    const filter: any = {};
    if (type === "campaign") {
      filter.campaignStatus = { $exists: true, $ne: null };
    } else if (type === "regular") {
      filter.campaignStatus = { $exists: false };
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("userId", "name email")
        .populate("volunteers", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(filter),
    ]);

    res.json({
      posts,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

export const deletePost = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    res.json({ message: "Post deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete post" });
  }
};

export const updateCampaignStatus = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.body;
    if (!["proposed", "started", "completed", "ended"].includes(status)) {
      res.status(400).json({ error: "Invalid campaign status" });
      return;
    }
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    if (!post.campaignStatus) {
      res.status(400).json({ error: "This post is not a campaign" });
      return;
    }
    post.campaignStatus = status;
    await post.save();
    const populated = await Post.findById(post._id)
      .populate("userId", "name email")
      .populate("volunteers", "name");
    res.json(populated);
  } catch {
    res.status(500).json({ error: "Failed to update campaign status" });
  }
};
