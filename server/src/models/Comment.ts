import mongoose, { Schema, Document } from "mongoose";

export interface CommentDocument extends Document {
  text: string;
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const commentSchema = new Schema<CommentDocument>(
  {
    text: { type: String, required: true, maxlength: 2000 },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

commentSchema.index({ postId: 1, createdAt: 1 });

export default mongoose.model<CommentDocument>("Comment", commentSchema);
