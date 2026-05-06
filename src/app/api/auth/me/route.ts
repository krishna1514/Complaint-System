import { verifyToken } from "@/lib/auth-client";
import { connectDB } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/helpers";
import User from "@/models/User";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("scrrs_token")?.value;
    if (!token) return errorResponse("Unauthorized", 401);

    const decoded = verifyToken(token);

    if (!decoded) return errorResponse("Unauthorized", 401);

    await connectDB();
    const user = await User.findById(decoded?.id);

    if (!user) return errorResponse("User not found", 404);

    return successResponse({ user });
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}
