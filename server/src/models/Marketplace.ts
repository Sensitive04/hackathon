import mongoose, { Schema, Document } from "mongoose";

export interface MarketplaceDocument extends Document {
  title: string;
  description: string;
  images: string[];
  category: string;
  condition: "excellent" | "good" | "fair" | "poor";
  price: number;
  listingType: "sale" | "free" | "recycle";
  sellerId: mongoose.Types.ObjectId;
  status: "available" | "sold" | "expired" | "recycled";
  expiresAt: Date;
}

const marketplaceSchema = new Schema<MarketplaceDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    images: [{ type: String }],
    category: {
      type: String,
      required: true,
      enum: [
        "electronics",
        "furniture",
        "clothing",
        "books",
        "appliances",
        "other",
      ],
    },
    condition: {
      type: String,
      required: true,
      enum: ["excellent", "good", "fair", "poor"],
    },
    price: { type: Number, required: true, min: 0 },
    listingType: {
      type: String,
      required: true,
      enum: ["sale", "free", "recycle"],
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["available", "sold", "expired", "recycled"],
      default: "available",
      index: true,
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

marketplaceSchema.index({ status: 1, category: 1 });

export default mongoose.model<MarketplaceDocument>(
  "Marketplace",
  marketplaceSchema
);
