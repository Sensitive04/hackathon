import { Response } from "express";
import { IAuthRequest } from "../types/index.js";
import RecyclePickup from "../models/RecyclePickup.js";
import Marketplace from "../models/Marketplace.js";

export const getPendingPickups = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const pickups = await RecyclePickup.find({ status: "pending" })
      .populate("listingId", "title description images category condition")
      .populate("requesterId", "name avatar")
      .sort({ createdAt: -1 });

    res.json(pickups);
  } catch {
    res.status(500).json({ error: "Failed to fetch pending pickups" });
  }
};

export const claimPickup = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const pickup = await RecyclePickup.findOne({
      listingId: req.params.listingId,
    });
    if (!pickup) {
      res.status(404).json({ error: "Recycle pickup not found" });
      return;
    }
    if (pickup.status !== "pending") {
      res.status(400).json({ error: "Pickup is no longer pending" });
      return;
    }

    pickup.recyclerId = req.user!.id as any;
    pickup.status = "claimed";
    await pickup.save();

    const populated = await pickup
      .populate([
        { path: "listingId", select: "title description images category condition" },
        { path: "requesterId", select: "name avatar" },
        { path: "recyclerId", select: "name avatar" },
      ]);

    res.json(populated);
  } catch {
    res.status(500).json({ error: "Failed to claim pickup" });
  }
};

export const updatePickupStatus = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status, notes, scheduledDate } = req.body;
    const validStatuses = ["pending", "claimed", "picked_up", "completed"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const pickup = await RecyclePickup.findById(req.params.id);
    if (!pickup) {
      res.status(404).json({ error: "Pickup not found" });
      return;
    }

    pickup.status = status;
    if (notes !== undefined) pickup.notes = notes;
    if (scheduledDate) pickup.scheduledDate = new Date(scheduledDate);
    await pickup.save();

    if (status === "completed") {
      await Marketplace.findByIdAndUpdate(pickup.listingId, {
        status: "recycled",
      });
    }

    const populated = await pickup
      .populate([
        { path: "listingId", select: "title description images category condition" },
        { path: "requesterId", select: "name avatar" },
        { path: "recyclerId", select: "name avatar" },
      ]);

    res.json(populated);
  } catch {
    res.status(500).json({ error: "Failed to update status" });
  }
};

export const getMyPickups = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const pickups = await RecyclePickup.find({ recyclerId: req.user!.id })
      .populate("listingId", "title description images category condition")
      .populate("requesterId", "name avatar")
      .sort({ createdAt: -1 });

    res.json(pickups);
  } catch {
    res.status(500).json({ error: "Failed to fetch pickups" });
  }
};

export const getMyRequests = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const pickups = await RecyclePickup.find({ requesterId: req.user!.id })
      .populate("listingId", "title description images category condition")
      .populate("recyclerId", "name avatar")
      .sort({ createdAt: -1 });

    res.json(pickups);
  } catch {
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};
