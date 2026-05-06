import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth-client";
import { JWTPayload } from "@/types";

const COOKIE_NAME = "scrrs_token";

export function getCurrentUserFromRequest(req: NextRequest): JWTPayload | null {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function setAuthCookieOnResponse<T>(
  response: NextResponse<T>,
  token: string
): NextResponse<T> {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}

export function clearAuthCookieOnResponse<T>(
  response: NextResponse<T>
): NextResponse<T> {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
  return response;
}