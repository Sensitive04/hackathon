import { Response } from "express";
import { IAuthRequest } from "../types/index.js";
import User from "../models/User.js";
import Marketplace from "../models/Marketplace.js";
import RecyclePickup from "../models/RecyclePickup.js";

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
    if (!["user", "admin", "recycler"].includes(role)) {
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

export const createRecycler = async (
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
    const user = await User.create({ name, email, password, role: "recycler" });
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch {
    res.status(500).json({ error: "Failed to create recycler" });
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

    const [items, total] = await Promise.all([
      Marketplace.find()
        .populate("sellerId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Marketplace.countDocuments(),
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
    await RecyclePickup.deleteOne({ listingId: req.params.id });
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
      recyclerCount,
      userCount,
      totalListings,
      activeListings,
      soldListings,
      recycledListings,
      pendingPickups,
      completedPickups,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "recycler" }),
      User.countDocuments({ role: "user" }),
      Marketplace.countDocuments(),
      Marketplace.countDocuments({ status: "available" }),
      Marketplace.countDocuments({ status: "sold" }),
      Marketplace.countDocuments({ status: "recycled" }),
      RecyclePickup.countDocuments({ status: "pending" }),
      RecyclePickup.countDocuments({ status: "completed" }),
    ]);

    res.json({
      totalUsers,
      adminCount,
      recyclerCount,
      userCount,
      totalListings,
      activeListings,
      soldListings,
      recycledListings,
      pendingPickups,
      completedPickups,
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

export const getAllPickups = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [pickups, total] = await Promise.all([
      RecyclePickup.find(filter)
        .populate("listingId", "title description images category condition")
        .populate("requesterId", "name email avatar")
        .populate("recyclerId", "name email avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      RecyclePickup.countDocuments(filter),
    ]);

    res.json({
      pickups,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch pickups" });
  }
};

export const reassignPickup = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { recyclerId } = req.body;
    const pickup = await RecyclePickup.findById(req.params.id);
    if (!pickup) {
      res.status(404).json({ error: "Pickup not found" });
      return;
    }

    if (recyclerId) {
      const recycler = await User.findById(recyclerId);
      if (!recycler || (recycler.role !== "recycler" && recycler.role !== "admin")) {
        res.status(400).json({ error: "Invalid recycler" });
        return;
      }
      pickup.recyclerId = recyclerId;
      pickup.status = "claimed";
    } else {
      pickup.recyclerId = null as any;
      pickup.status = "pending";
    }

    await pickup.save();

    const populated = await pickup
      .populate([
        { path: "listingId", select: "title description images category condition" },
        { path: "requesterId", select: "name email avatar" },
        { path: "recyclerId", select: "name email avatar" },
      ]);

    res.json(populated);
  } catch {
    res.status(500).json({ error: "Failed to reassign pickup" });
  }
};

export const deletePickup = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const pickup = await RecyclePickup.findByIdAndDelete(req.params.id);
    if (!pickup) {
      res.status(404).json({ error: "Pickup not found" });
      return;
    }
    res.json({ message: "Pickup deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete pickup" });
  }
};
