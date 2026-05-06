import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/helpers";
import User from "@/models/User";
import { getCurrentUserFromRequest } from "@/lib/auth-route";

export async function PUT(req: NextRequest) {
  try {
    const authUser = getCurrentUserFromRequest(req);
    if (!authUser) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const { name, department } = body;

    if (!name || name.trim().length < 2) {
      return errorResponse("Name must be at least 2 characters");
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(
      authUser.id,
      { name: name.trim(), department: department ?? undefined },
      { new: true, runValidators: true },
    );

    if (!user) return errorResponse("User not found", 404);

    return successResponse({ user }, "Profile updated successfully");
  } catch {
    return errorResponse("Failed to update profile", 500);
  }
}
