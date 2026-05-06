import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/helpers";
import User from "@/models/User";
import { getCurrentUserFromRequest } from "@/lib/auth-route";

export async function GET(req: NextRequest) {
  try {
    const authUser = getCurrentUserFromRequest(req);
    if (!authUser) return errorResponse("Unauthorized", 401);

    await connectDB();
    const user = await User.findById(authUser.id);
    if (!user) return errorResponse("User not found", 404);

    return successResponse({ user });
  } catch {
    return errorResponse("Failed to fetch profile", 500);
  }
}
