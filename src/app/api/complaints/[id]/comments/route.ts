import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/helpers";
import Comment from "@/models/Comment";
import Complaint from "@/models/Complaint";
import { createTimelineEvent } from "@/models/Timeline";
import User from "@/models/User";
import { getCurrentUserFromRequest } from "@/lib/auth-route";
import { Types } from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = getCurrentUserFromRequest(req);
    if (!authUser) return errorResponse("Unauthorized", 401);

    const { id } = await params;

    await connectDB();
    const complaint = await Complaint.findById(id);
    if (!complaint) return errorResponse("Complaint not found", 404);
    if (
      authUser.role === "user" &&
      complaint.submittedBy.toString() !== authUser.id
    ) {
      return errorResponse("Access denied", 403);
    }

    const comments = await Comment.find({ complaintId: id })
      .populate("userId", "name email role")
      .sort({ createdAt: 1 });
    return successResponse({ comments });
  } catch {
    return errorResponse("Failed to fetch comments", 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getCurrentUserFromRequest(req  );
    if (!authUser) return errorResponse("Unauthorized", 401);

    const { id } = await params;

    const { message } = await req.json();
    if (!message?.trim()) return errorResponse("Message is required");

    await connectDB();

    const complaint = await Complaint.findById(id);
    if (!complaint) return errorResponse("Complaint not found", 404);
    if (
      authUser.role === "user" &&
      complaint.submittedBy.toString() !== authUser.id
    ) {
      return errorResponse("Access denied", 403);
    }

    const comment = await Comment.create({
      complaintId: id,
      userId: new Types.ObjectId(authUser.id),
      message: message.trim(),
    });

    const actor = await User.findById(authUser.id).select("name");
    await createTimelineEvent({
      complaintId: id,
      type: "comment",
      title: "Comment Added",
      description: `${actor?.name ?? "User"} added a comment`,
      actor: actor?.name ?? "User",
    });

    const populated = await comment.populate("userId", "name email role");
    return successResponse({ comment: populated }, "Comment added", 201);
  } catch {
    return errorResponse("Failed to add comment", 500);
  }
}
