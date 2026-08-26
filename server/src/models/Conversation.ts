import mongoose, { Schema, Document } from "mongoose";

export interface ConversationDocument extends Document {
  participants: mongoose.Types.ObjectId[];
  listingId?: mongoose.Types.ObjectId;
  lastMessage: string;
  lastMessageAt: Date;
}

const conversationSchema = new Schema<ConversationDocument>(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    listingId: { type: Schema.Types.ObjectId, ref: "Marketplace" },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });

export default mongoose.model<ConversationDocument>(
  "Conversation",
  conversationSchema
);
