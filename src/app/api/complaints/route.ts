import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import {
  successResponse,
  errorResponse,
  suggestDepartment,
  getPagination,
  paginationMeta,
  detectPriority,
} from "@/lib/helpers";
import Complaint, { getNextComplaintId } from "@/models/Complaint";
import { createTimelineEvent } from "@/models/Timeline";
import User from "@/models/User";
import { getCurrentUserFromRequest } from "@/lib/auth-route";
import { Types } from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const authUser = getCurrentUserFromRequest(req);
    if (!authUser) return errorResponse("Unauthorized", 401);

    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = getPagination(
      searchParams.get("page") ?? "1",
      searchParams.get("limit") ?? "10",
    );

    const status = searchParams.get("status");
    const department = searchParams.get("department");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");

    const filter: Record<string, unknown> = {};

    if (authUser.role === "user") filter.submittedBy = authUser.id;
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { complaintId: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    await connectDB();

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate("submittedBy", "name email")
        .populate("assignedTo", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Complaint.countDocuments(filter),
    ]);

    return successResponse({
      complaints,
      pagination: paginationMeta(total, page, limit),
    });
  } catch {
    return errorResponse("Failed to fetch complaints", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = getCurrentUserFromRequest(req);
    if (!authUser) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const { title, description, category, location, attachments } = body;
    let { department } = body;

    const priority = body.priority || detectPriority(title, description);

    if (!title || !description || !category || !location) {
      return errorResponse(
        "Title, description, category and location are required",
      );
    }

    await connectDB();

    const existingDuplicate = await Complaint.findOne({
      submittedBy: authUser.id,
      title: { $regex: new RegExp(`^${title.trim()}$`, "i") },
      status: { $ne: "Resolved" },
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // last 7 days
    });

    if (existingDuplicate) {
      return errorResponse(
        "You already submitted a similar complaint recently. Please check your dashboard.",
      );
    }

    if (!department) {
      department = suggestDepartment(title, description);
    }

    const complaintId = await getNextComplaintId();

    const complaint = await Complaint.create({
      complaintId,
      title: title.trim(),
      description: description.trim(),
      department,
      category: category.trim(),
      location: location.trim(),
      priority: priority ?? "Medium",
      status: "Pending",
      submittedBy: new Types.ObjectId(authUser.id),
      attachments: attachments ?? [],
    });

    // Auto-assign to staff in same department if any
    if (authUser.role !== "user") {
      const staff = await User.findOne({ role: "staff", department });
      if (staff) {
        complaint.assignedTo = staff._id;
        await complaint.save();
      }
    }

    const submitter = await User.findById(authUser.id).select("name");
    await createTimelineEvent({
      complaintId: complaint._id.toString(),
      type: "created",
      title: "Complaint Submitted",
      description: `Complaint ${complaintId} was submitted and routed to ${department} department`,
      actor: submitter?.name ?? "User",
    });

    const populated = await complaint.populate([
      { path: "submittedBy", select: "name email" },
      { path: "assignedTo", select: "name email role" },
    ]);

    return successResponse(
      { complaint: populated },
      "Complaint submitted successfully",
      201,
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create complaint";
    return errorResponse(message, 500);
  }
}
