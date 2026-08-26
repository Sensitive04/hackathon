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
      description || "User uploaded image of item"
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

export const getMarketplace = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { category, status, search } = req.query;

    const filter: any = { status: status || "available" };
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const items = await Marketplace.find(filter)
      .populate("sellerId", "name avatar")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(items);
  } catch {
    res.status(500).json({ error: "Failed to fetch marketplace" });
  }
};

export const getItem = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const item = await Marketplace.findById(req.params.id).populate(
      "sellerId",
      "name avatar"
    );
    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }
    res.json(item);
  } catch {
    res.status(500).json({ error: "Failed to fetch item" });
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
    const items = await Marketplace.find({ sellerId: req.user!.id }).sort({
      createdAt: -1,
    });
    res.json(items);
  } catch {
    res.status(500).json({ error: "Failed to fetch listings" });
  }
};
