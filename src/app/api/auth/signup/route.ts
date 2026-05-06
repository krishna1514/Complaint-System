import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { setAuthCookieOnResponse } from "@/lib/auth-route";
import {
  successResponse,
  errorResponse,
  validateEmail,
  validatePassword,
} from "@/lib/helpers";
import User from "@/models/User";
import { signToken } from "@/lib/auth-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role, department } = body;

    if (!name || !email || !password) {
      return errorResponse("Name, email and password are required");
    }
    if (name.trim().length < 2)
      return errorResponse("Name must be at least 2 characters");
    if (!validateEmail(email)) return errorResponse("Invalid email address");
    const pwdError = validatePassword(password);
    if (pwdError) return errorResponse(pwdError);

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return errorResponse("Email already registered", 409);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role === "admin" || role === "staff" ? role : "user",
      department: department ?? undefined,
    });

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
        },
      },
      "Account created successfully",
      201,
    );

    return setAuthCookieOnResponse(response, token);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Signup failed";
    return errorResponse(message, 500);
  }
}
