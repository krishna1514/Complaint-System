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

    const filter = authUser.role === "user" ? { submittedBy: new Types.ObjectId(authUser.id) } : {};

    // Get last 7 days
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const complaints = await Complaint.find({
      ...filter,
      createdAt: { $gte: startDate },
    }).lean();

    const trend = days.map((day, idx) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + idx);
      const dateStr = date.toISOString().split("T")[0];
      const submitted = complaints.filter(
        (c) => c.createdAt.toISOString().split("T")[0] === dateStr,
      ).length;
      const resolved = complaints.filter(
        (c) =>
          c.status === "Resolved" &&
          c.updatedAt.toISOString().split("T")[0] === dateStr,
      ).length;
      return { day, submitted, resolved };
    });

    return successResponse({ trend });
  } catch (error) {
    return errorResponse("Failed to fetch trends", 500);
  }
}
