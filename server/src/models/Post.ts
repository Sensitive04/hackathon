import mongoose, { Schema, Document } from "mongoose";

export interface PostDocument extends Document {
  userId: mongoose.Types.ObjectId;
  content: string;
  images: string[];
  hashtags: string[];
  likes: mongoose.Types.ObjectId[];
  campaignStatus?: "proposed" | "started" | "completed" | "ended";
  volunteerNeeded: number;
  volunteers: mongoose.Types.ObjectId[];
  conversationId?: mongoose.Types.ObjectId;
}

const postSchema = new Schema<PostDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, required: true, maxlength: 5000 },
    images: [{ type: String }],
    hashtags: [{ type: String, lowercase: true, trim: true }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    campaignStatus: {
      type: String,
      enum: ["proposed", "started", "completed", "ended"],
    },
    volunteerNeeded: { type: Number, default: 0, min: 0, max: 100 },
    volunteers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", default: null },
  },
  { timestamps: true }
);

postSchema.index({ hashtags: 1 });
postSchema.index({ createdAt: -1 });

export default mongoose.model<PostDocument>("Post", postSchema);
