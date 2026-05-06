import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/helpers";
import Complaint from "@/models/Complaint";
import { getCurrentUserFromRequest } from "@/lib/auth-route";

export async function GET(req: NextRequest) {
  try {
    const authUser = getCurrentUserFromRequest(req);
    if (!authUser || authUser.role !== "admin") {
      return errorResponse("Admin access required", 403);
    }

    await connectDB();

    const [total, pending, inProgress, resolved, urgent, resolvedComplaints] =
      await Promise.all([
        Complaint.countDocuments(),
        Complaint.countDocuments({ status: "Pending" }),
        Complaint.countDocuments({ status: "In Progress" }),
        Complaint.countDocuments({ status: "Resolved" }),
        Complaint.countDocuments({ priority: "Urgent" }),
        Complaint.find({ status: "Resolved" }).select("createdAt updatedAt"),
      ]);

    // Average resolution time in hours
    let avgResolutionTime = 0;
    if (resolvedComplaints.length > 0) {
      const totalMs = resolvedComplaints.reduce((acc, c) => {
        return acc + (c.updatedAt.getTime() - c.createdAt.getTime());
      }, 0);
      avgResolutionTime = Math.round(
        totalMs / resolvedComplaints.length / (1000 * 60 * 60),
      );
    }

    // Mock satisfaction score (70-95% range based on resolution rate)
    const resolutionRate = total > 0 ? resolved / total : 0;
    const satisfaction = Math.round(70 + resolutionRate * 25);

    return successResponse({
      stats: {
        total,
        pending,
        inProgress,
        resolved,
        urgent,
        avgResolutionTime,
        satisfaction,
        resolutionRate: Math.round(resolutionRate * 100),
      },
    });
  } catch {
    return errorResponse("Failed to fetch stats", 500);
  }
}
