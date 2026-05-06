import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/helpers";
import Timeline from "@/models/Timeline";
import Complaint from "@/models/Complaint";
import { getCurrentUserFromRequest } from "@/lib/auth-route";

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

    const timeline = await Timeline.find({ complaintId: id }).sort({
      timestamp: 1,
    });
    return successResponse({ timeline });
  } catch {
    return errorResponse("Failed to fetch timeline", 500);
  }
}
