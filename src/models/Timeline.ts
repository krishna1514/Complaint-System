import mongoose, { Schema, Model, Document } from "mongoose";
import { ITimeline } from "@/types";

export interface ITimelineDocument extends Omit<ITimeline, "_id">, Document {}

const TimelineSchema = new Schema<ITimelineDocument>(
  {
    complaintId: {
      type: Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["created", "assigned", "updated", "resolved", "comment"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    actor: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

const Timeline: Model<ITimelineDocument> =
  mongoose.models.Timeline ??
  mongoose.model<ITimelineDocument>("Timeline", TimelineSchema);

export default Timeline;

// ─── Helper: Create timeline event ───────────────────────────────────────────

export async function createTimelineEvent(params: {
  complaintId: string;
  type: ITimeline["type"];
  title: string;
  description: string;
  actor: string;
}): Promise<void> {
  await Timeline.create(params);
}