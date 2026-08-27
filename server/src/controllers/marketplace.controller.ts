import { Response } from "express";
import { IAuthRequest } from "../types/index.js";
import * as aiService from "../services/ai.service.js";
import Marketplace from "../models/Marketplace.js";

export const analyzeItem = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { description, imageBase64 } = req.body;

    if (!description && !imageBase64) {
      res
        .status(400)
        .json({ error: "Item description or image is required" });
      return;
    }

    const analysis = await aiService.analyzeRecycling(
      description || "User uploaded image of item",
      imageBase64
    );
    res.json(analysis);
  } catch (error) {
    console.error("Recycling analysis error:", error);
    res.status(500).json({ error: "Analysis failed" });
  }
};

export const listItem = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, description, images, category, condition, price, listingType } =
      req.body;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const item = await Marketplace.create({
      title,
      description,
      images: images || [],
      category,
      condition,
      price: listingType === "free" ? 0 : price,
      listingType,
      sellerId: req.user!.id,
      expiresAt,
    });

    res.status(201).json(item);
  } catch (error) {
    console.error("List item error:", error);
    res.status(500).json({ error: "Failed to list item" });
  }
};

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const getMarketplace = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { category, status, search, listingType } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status === "all") {
      // no status filter — return items of all statuses
    } else {
      filter.status = status || "available";
    }
    if (category) filter.category = category;
    if (listingType) filter.listingType = listingType;
    if (search) {
      const safe = escapeRegex(search as string);
      filter.$or = [
        { title: { $regex: safe, $options: "i" } },
        { description: { $regex: safe, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      Marketplace.find(filter)
        .populate("sellerId", "name avatar")
        .populate("pendingBuyerId", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Marketplace.countDocuments(filter),
    ]);

    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: "Failed to fetch marketplace" });
  }
};

export const getItem = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const item = await Marketplace.findById(req.params.id)
      .populate("sellerId", "name avatar")
      .populate("pendingBuyerId", "name avatar");
    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }
    res.json(item);
  } catch {
    res.status(500).json({ error: "Failed to fetch item" });
  }
};

export const contactSeller = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const item = await Marketplace.findById(req.params.id);
    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }
    if (item.listingType !== "sale") {
      res.status(400).json({ error: "Contact seller is only for sale items" });
      return;
    }
    if (item.status !== "available") {
      res.status(400).json({ error: "Item is no longer available" });
      return;
    }
    if (item.sellerId.toString() === req.user!.id) {
      res.status(400).json({ error: "Cannot contact yourself" });
      return;
    }

    item.status = "pending";
    item.pendingBuyerId = req.user!.id as any;
    await item.save();

    res.json({ message: "Seller notified", item });
  } catch {
    res.status(500).json({ error: "Failed to contact seller" });
  }
};

export const confirmSale = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await Marketplace.findById(id);
    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }
    if (item.sellerId.toString() !== req.user!.id) {
      res.status(403).json({ error: "Only the seller can confirm this sale" });
      return;
    }
    if (item.status !== "pending") {
      res.status(400).json({ error: "Item is not pending a sale" });
      return;
    }

    item.status = "sold";
    await item.save();

    res.json({ message: "Sale confirmed", item });
  } catch {
    res.status(500).json({ error: "Failed to confirm sale" });
  }
};

export const cancelSale = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await Marketplace.findById(id);
    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }
    if (item.sellerId.toString() !== req.user!.id) {
      res.status(403).json({ error: "Only the seller can cancel this sale" });
      return;
    }
    if (item.status !== "pending") {
      res.status(400).json({ error: "Item is not pending a sale" });
      return;
    }

    item.status = "available";
    item.pendingBuyerId = undefined;
    await item.save();

    res.json({ message: "Sale cancelled", item });
  } catch {
    res.status(500).json({ error: "Failed to cancel sale" });
  }
};

export const purchaseItem = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const item = await Marketplace.findById(req.params.id);
    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }
    if (item.status !== "available") {
      res.status(400).json({ error: "Item is no longer available" });
      return;
    }
    if (item.sellerId.toString() === req.user!.id) {
      res.status(400).json({ error: "Cannot purchase your own item" });
      return;
    }
    if (item.listingType === "sale") {
      res.status(400).json({ error: "Sale items require seller confirmation. Use Contact Seller instead." });
      return;
    }

    item.status = "sold";
    await item.save();

    res.json({ message: "Purchase successful", item });
  } catch {
    res.status(500).json({ error: "Purchase failed" });
  }
};

export const getMyListings = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status, listingType } = req.query;
    const filter: any = { sellerId: req.user!.id };
    if (status) filter.status = status;
    if (listingType) filter.listingType = listingType;
    const items = await Marketplace.find(filter).sort({
      createdAt: -1,
    });
    res.json(items);
  } catch {
    res.status(500).json({ error: "Failed to fetch listings" });
  }
};
