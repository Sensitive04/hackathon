import mongoose, { Schema, Document } from "mongoose";

export interface RecyclePickupDocument extends Document {
  listingId: mongoose.Types.ObjectId;
  requesterId: mongoose.Types.ObjectId;
  recyclerId?: mongoose.Types.ObjectId;
  status: "pending" | "claimed" | "picked_up" | "completed";
  notes: string;
  scheduledDate?: Date;
}

const recyclePickupSchema = new Schema<RecyclePickupDocument>(
  {
    listingId: {
      type: Schema.Types.ObjectId,
      ref: "Marketplace",
      required: true,
      unique: true,
    },
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recyclerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      enum: ["pending", "claimed", "picked_up", "completed"],
      default: "pending",
    },
    notes: { type: String, default: "" },
    scheduledDate: { type: Date, default: null },
  },
  { timestamps: true }
);

recyclePickupSchema.index({ status: 1 });

export default mongoose.model<RecyclePickupDocument>(
  "RecyclePickup",
  recyclePickupSchema
);
