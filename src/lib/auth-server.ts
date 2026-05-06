"use server";
import { cookies } from "next/headers";

const COOKIE_NAME = "scrrs_token";

// ─── Cookie Helpers ──────────────────────────────────────────────────────────

/**
 * Retrieve the authentication token from cookies
 */
export async function getTokenFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAME)?.value ?? null;
  } catch (error) {
    console.error("Failed to read cookie:", error);
    return null;
  }
}

/**
 * Set the authentication cookie (httpOnly, secure)
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

/**
 * Clear the authentication cookie (logout)
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
}

/**
 * Check if the user is authenticated (token exists & valid)
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getTokenFromCookies();
  return token !== null;
}
