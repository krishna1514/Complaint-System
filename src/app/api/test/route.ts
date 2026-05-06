// app/api/debug/route.ts - temporary
import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth-client";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("scrrs_token")?.value;
  
  return Response.json({
    hasToken: !!token,
    tokenPreview: token?.slice(0, 20),
    verifyResult: token ? verifyToken(token) : "no token",
    jwtSecretLength: process.env.JWT_SECRET?.length,
    // First and last 2 chars to confirm it matches without exposing it
    jwtSecretEnds: process.env.JWT_SECRET 
      ? `${process.env.JWT_SECRET.slice(0,2)}...${process.env.JWT_SECRET.slice(-2)}`
      : "missing",
  });
}