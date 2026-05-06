import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/helpers";
import Complaint from "@/models/Complaint";
import { getCurrentUserFromRequest } from "@/lib/auth-route";

export async function GET(req: NextRequest) {
  try {
     const authUser = getCurrentUserFromRequest(req );
    if (!authUser || authUser.role !== "admin") {
      return errorResponse("Admin access required", 403);
    }

    await connectDB();

    const [byDepartment, byPriority, byStatus, byCategory] = await Promise.all([
      // Department distribution
      Complaint.aggregate([
        { $group: { _id: "$department", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Priority distribution
      Complaint.aggregate([
        { $group: { _id: "$priority", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Status distribution
      Complaint.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),

      // Top categories
      Complaint.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const formatList = (arr: { _id: string; count: number }[]) =>
      arr.map(({ _id, count }) => ({ label: _id, value: count }));

    return successResponse({
      distribution: {
        byDepartment: formatList(byDepartment),
        byPriority: formatList(byPriority),
        byStatus: formatList(byStatus),
        byCategory: formatList(byCategory),
      },
    });
  } catch {
    return errorResponse("Failed to fetch distribution", 500);
  }
}
