import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/helpers";
import User from "@/models/User";
import { getCurrentUserFromRequest } from "@/lib/auth-route";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getCurrentUserFromRequest(req);
    if (!authUser || authUser.role !== "admin")
      return errorResponse("Admin access required", 403);
    await connectDB();
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return successResponse({ users });
  } catch {
    return errorResponse("Failed to fetch users", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = getCurrentUserFromRequest(req);
    if (!authUser || authUser.role !== "admin")
      return errorResponse("Admin access required", 403);
    const body = await req.json();
    const { name, email, password, role, department } = body;
    if (!name || !email || !password) return errorResponse("Missing fields");
    await connectDB();
    const existing = await User.findOne({ email });
    if (existing) return errorResponse("Email already exists", 409);
    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
      department,
    });
    const { password: _password, ...userWithoutPassword } = user.toObject();

    return successResponse({ user: userWithoutPassword }, "User created", 201);
  } catch {
    return errorResponse("Failed to create user", 500);
  }
}
