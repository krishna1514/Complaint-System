import { clearAuthCookie } from "@/lib/auth-server";
import { successResponse } from "@/lib/helpers";

export async function POST() {
  await clearAuthCookie();
  return successResponse(null, "Logged out successfully");
}