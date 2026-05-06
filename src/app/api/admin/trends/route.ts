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

    // Last 7 days
    const days: { label: string; date: Date }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push({
        label: d.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
        }),
        date: d,
      });
    }

    // Aggregate complaints per day
    const weekStart = new Date(days[0].date);
    const rawData = await Complaint.aggregate([
      { $match: { createdAt: { $gte: weekStart } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          submitted: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] },
          },
        },
      },
    ]);

    const dataMap = new Map(rawData.map((r) => [r._id, r]));

    const trend = days.map(({ label, date }) => {
      const key = date.toISOString().split("T")[0];
      const entry = dataMap.get(key);
      return {
        day: label,
        submitted: entry?.submitted ?? 0,
        resolved: entry?.resolved ?? 0,
      };
    });

    return successResponse({ trend });
  } catch {
    return errorResponse("Failed to fetch trends", 500);
  }
}
