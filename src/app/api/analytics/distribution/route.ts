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

    const byDepartment = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const byStatus = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const byPriority = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    const byCategory = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    return successResponse({
      distribution: {
        byDepartment: byDepartment.map((d) => ({
          label: d._id,
          value: d.count,
        })),
        byStatus: byStatus.map((d) => ({ label: d._id, value: d.count })),
        byPriority: byPriority.map((d) => ({ label: d._id, value: d.count })),
        byCategory: byCategory.map((d) => ({ label: d._id, value: d.count })),
      },
    });
  } catch (error) {
    return errorResponse("Failed to fetch distribution", 500);
  }
}
