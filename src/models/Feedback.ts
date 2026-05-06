import mongoose, { Schema, Model, Document } from "mongoose";

export interface IFeedback extends Document {
  complaintId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    complaintId: {
      type: Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true, versionKey: false },
);

const Feedback: Model<IFeedback> =
  mongoose.models.Feedback ?? mongoose.model("Feedback", FeedbackSchema);

export default Feedback;
