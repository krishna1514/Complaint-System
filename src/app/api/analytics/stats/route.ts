import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/helpers";
import Complaint from "@/models/Complaint";
import { getCurrentUserFromRequest } from "@/lib/auth-route";
import { Types } from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const authUser = getCurrentUserFromRequest(req);
    if (!authUser) return errorResponse("Unauthorized", 401);

    await connectDB();

    const filter =
      authUser.role === "user"
        ? { submittedBy: new Types.ObjectId(authUser.id) }
        : {};

    const stats = await Complaint.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] },
          },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] },
          },
          urgent: { $sum: { $cond: [{ $eq: ["$priority", "Urgent"] }, 1, 0] } },
          avgResolutionTime: {
            $avg: { $subtract: ["$updatedAt", "$createdAt"] },
          },
        },
      },
    ]);

    const result = stats[0] || {
      total: 0,
      pending: 0,
      inProgress: 0,
      resolved: 0,
      urgent: 0,
      avgResolutionTime: 0,
    };

    // Convert milliseconds to hours
    const avgHours = Math.round(result.avgResolutionTime / (1000 * 60 * 60));
    result.avgResolutionTime = avgHours;

    return successResponse({ stats: result });
  } catch (error) {
    return errorResponse("Failed to fetch stats", 500);
  }
}
