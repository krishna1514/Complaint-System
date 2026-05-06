import mongoose, { Schema, Model, Document } from "mongoose";
import { IComplaint } from "@/types";

export interface IComplaintDocument extends Omit<IComplaint, "_id">, Document {}

// ─── Counter Schema for auto-incrementing complaint IDs ───────────────────────

const CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter =
  mongoose.models.Counter ?? mongoose.model("Counter", CounterSchema);

export async function getNextComplaintId(): Promise<string> {
  const counter = await Counter.findByIdAndUpdate(
    "complaintId",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const padded = String(counter.seq).padStart(4, "0");
  return `CMP-${padded}`;
}

// ─── Complaint Schema ─────────────────────────────────────────────────────────

const ComplaintSchema = new Schema<IComplaintDocument>(
  {
    complaintId: {
      type: String,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: 5,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    department: {
      type: String,
      enum: ["IT", "Electrical", "Maintenance", "Cleaning", "General"],
      required: [true, "Department is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    attachments: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ─── Indexes for search & filtering ──────────────────────────────────────────

ComplaintSchema.index({ status: 1 });
ComplaintSchema.index({ department: 1 });
ComplaintSchema.index({ priority: 1 });
ComplaintSchema.index({ submittedBy: 1 });
ComplaintSchema.index({ createdAt: -1 });
ComplaintSchema.index(
  { title: "text", location: "text", complaintId: "text" },
  { name: "complaint_search" }
);

const Complaint: Model<IComplaintDocument> =
  mongoose.models.Complaint ??
  mongoose.model<IComplaintDocument>("Complaint", ComplaintSchema);

export default Complaint;