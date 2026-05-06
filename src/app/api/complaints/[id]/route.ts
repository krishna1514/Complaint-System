import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/helpers";
import Complaint from "@/models/Complaint";
import { createTimelineEvent } from "@/models/Timeline";
import User from "@/models/User";
import { getCurrentUserFromRequest } from "@/lib/auth-route";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const authUser = getCurrentUserFromRequest(req);
    if (!authUser) return errorResponse("Unauthorized", 401);

    await connectDB();

    const complaint = await Complaint.findById(id)
      .populate("submittedBy", "name email")
      .populate("assignedTo", "name email role department");

    if (!complaint) return errorResponse("Complaint not found", 404);

    if (
      authUser.role === "user" &&
      complaint.submittedBy._id.toString() !== authUser.id
    ) {
      return errorResponse("Access denied", 403);
    }

    return successResponse({ complaint });
  } catch {
    return errorResponse("Failed to fetch complaint", 500);
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const authUser = getCurrentUserFromRequest(req);
    if (!authUser) return errorResponse("Unauthorized", 401);

    const body = await req.json();

    await connectDB();

    const complaint = await Complaint.findById(id);
    if (!complaint) return errorResponse("Complaint not found", 404);

    const isOwner = complaint.submittedBy.toString() === authUser.id;
    const isPrivileged = authUser.role === "admin" || authUser.role === "staff";

    if (!isOwner && !isPrivileged) return errorResponse("Access denied", 403);

    const actor = await User.findById(authUser.id).select("name");
    const actorName = actor?.name ?? "System";

    const changes: string[] = [];

    if (body.status && body.status !== complaint.status) {
      complaint.status = body.status;
      changes.push(`Status changed to ${body.status}`);
    }

    if (isPrivileged) {
      if (body.priority && body.priority !== complaint.priority) {
        complaint.priority = body.priority;
        changes.push(`Priority changed to ${body.priority}`);
      }
      if (body.department && body.department !== complaint.department) {
        complaint.department = body.department;
        changes.push(`Department changed to ${body.department}`);
      }
      if (body.assignedTo !== undefined) {
        complaint.assignedTo = body.assignedTo || null;
        const assignedUser = body.assignedTo
          ? await User.findById(body.assignedTo).select("name")
          : null;
        changes.push(
          assignedUser ? `Assigned to ${assignedUser.name}` : "Unassigned",
        );
      }
    }

    if (isOwner && !isPrivileged) {
      if (complaint.status !== "Pending") {
        return errorResponse("Cannot edit complaint once it is in progress");
      }
      if (body.title) complaint.title = body.title.trim();
      if (body.description) complaint.description = body.description.trim();
      if (body.location) complaint.location = body.location.trim();
      changes.push("Complaint details updated");
    }

    await complaint.save();

    if (changes.length > 0) {
      const timelineType =
        body.status === "Resolved"
          ? "resolved"
          : body.assignedTo !== undefined
            ? "assigned"
            : "updated";

      await createTimelineEvent({
        complaintId: complaint._id.toString(),
        type: timelineType,
        title:
          timelineType === "resolved"
            ? "Complaint Resolved"
            : timelineType === "assigned"
              ? "Complaint Assigned"
              : "Complaint Updated",
        description: changes.join(", "),
        actor: actorName,
      });
    }

    const updated = await Complaint.findById(id)
      .populate("submittedBy", "name email")
      .populate("assignedTo", "name email role");

    return successResponse(
      { complaint: updated },
      "Complaint updated successfully",
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update complaint";
    return errorResponse(message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const authUser = getCurrentUserFromRequest(req);
    if (!authUser) return errorResponse("Unauthorized", 401);

    await connectDB();

    const complaint = await Complaint.findById(id);
    if (!complaint) return errorResponse("Complaint not found", 404);

    const isOwner = complaint.submittedBy.toString() === authUser.id;
    const isAdmin = authUser.role === "admin";

    if (!isOwner && !isAdmin) return errorResponse("Access denied", 403);
    if (isOwner && complaint.status !== "Pending") {
      return errorResponse("Can only delete pending complaints");
    }

    await complaint.deleteOne();

    return successResponse(null, "Complaint deleted successfully");
  } catch {
    return errorResponse("Failed to delete complaint", 500);
  }
}
