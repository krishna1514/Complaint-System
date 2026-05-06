import mongoose, { Schema, Model, Document } from "mongoose";
import { IComment } from "@/types";

export interface ICommentDocument extends Omit<IComment, "_id">, Document {}

const CommentSchema = new Schema<ICommentDocument>(
  {
    complaintId: {
      type: Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: 1,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Comment: Model<ICommentDocument> =
  mongoose.models.Comment ??
  mongoose.model<ICommentDocument>("Comment", CommentSchema);

export default Comment;