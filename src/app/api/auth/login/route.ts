import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { setAuthCookieOnResponse } from "@/lib/auth-route";
import { successResponse, errorResponse, validateEmail } from "@/lib/helpers";
import User from "@/models/User";
import { signToken } from "@/lib/auth-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password)
      return errorResponse("Email and password are required");
    if (!validateEmail(email)) return errorResponse("Invalid email address");

    await connectDB();

    // Explicitly select password (it's hidden by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );
    if (!user) return errorResponse("Invalid email or password", 401);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return errorResponse("Invalid email or password", 401);

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const response = successResponse(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
        },
      },
      "Login successful",
    );

    return setAuthCookieOnResponse(response, token);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed";
    return errorResponse(message, 500);
  }
}
