import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/helpers";
import User from "@/models/User";
import { getCurrentUserFromRequest } from "@/lib/auth-route";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authUser = getCurrentUserFromRequest(req);
    if (!authUser || authUser.role !== "admin")
      return errorResponse("Admin access required", 403);
    const { role, department } = await req.json();
    await connectDB();
    const user = await User.findById(id);
    if (!user) return errorResponse("User not found", 404);
    if (role) user.role = role;
    if (department !== undefined) user.department = department;
    await user.save();
    const updated = user.toObject();
    const { password, ...safeUser } = updated;

    return successResponse({ user: safeUser }, "User updated");
  } catch {
    return errorResponse("Failed to update user", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authUser = getCurrentUserFromRequest(req);
    if (!authUser || authUser.role !== "admin")
      return errorResponse("Admin access required", 403);
    await connectDB();
    const user = await User.findById(id);
    if (!user) return errorResponse("User not found", 404);
    if (user._id.toString() === authUser.id)
      return errorResponse("Cannot delete yourself", 400);
    await user.deleteOne();
    return successResponse(null, "User deleted");
  } catch {
    return errorResponse("Failed to delete user", 500);
  }
}
