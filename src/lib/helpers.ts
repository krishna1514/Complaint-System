import { NextResponse } from "next/server";
import { ApiResponse, Department, Priority } from "@/types";

// ─── Response Helpers ─────────────────────────────────────────────────────────

export function successResponse<T>(
  data: T,
  message?: string,
  status = 200,
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function errorResponse(
  error: string,
  status = 400,
): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error }, { status });
}

// ─── Complaint ID Generator ───────────────────────────────────────────────────

export function generateComplaintId(sequence: number): string {
  const padded = String(sequence).padStart(4, "0");
  return `CMP-${padded}`;
}

// ─── Smart Department Router ──────────────────────────────────────────────────

export const DEPARTMENT_KEYWORDS: Record<Department, string[]> = {
  IT: [
    "wifi",
    "network",
    "server",
    "laptop",
    "computer",
    "internet",
    "system",
    "software",
    "hardware",
    "printer",
    "cable",
    "router",
    "password",
    "login",
    "email",
    "database",
  ],
  Electrical: [
    "light",
    "fan",
    "ac",
    "air conditioner",
    "electricity",
    "power",
    "socket",
    "switch",
    "wiring",
    "bulb",
    "tube",
    "generator",
    "electric",
    "short circuit",
    "voltage",
  ],
  Maintenance: [
    "furniture",
    "leak",
    "tap",
    "water",
    "pipe",
    "door",
    "window",
    "wall",
    "ceiling",
    "floor",
    "chair",
    "table",
    "desk",
    "broken",
    "repair",
    "fix",
    "damage",
    "crack",
    "plumbing",
  ],
  Cleaning: [
    "trash",
    "washroom",
    "smell",
    "garbage",
    "dirty",
    "clean",
    "waste",
    "toilet",
    "bathroom",
    "hygiene",
    "pest",
    "cockroach",
    "rat",
    "insect",
    "dust",
    "sweep",
  ],
  General: [],
};

export function suggestDepartment(
  title: string,
  description: string,
): Department {
  const text = `${title} ${description}`.toLowerCase();

  let bestDept: Department = "General";
  let highestScore = 0;

  for (const [dept, keywords] of Object.entries(DEPARTMENT_KEYWORDS)) {
    if (dept === "General") continue;
    const score = keywords.reduce(
      (acc, kw) => acc + (text.includes(kw) ? 1 : 0),
      0,
    );
    if (score > highestScore) {
      highestScore = score;
      bestDept = dept as Department;
    }
  }

  return bestDept;
}

// ─── Validation Helpers ───────────────────────────────────────────────────────

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): string | null {
  if (password.length < 6) return "Password must be at least 6 characters";
  return null;
}

export function validateRequired(
  fields: Record<string, unknown>,
): string | null {
  for (const [key, value] of Object.entries(fields)) {
    if (!value && value !== 0) return `${key} is required`;
  }
  return null;
}

// ─── Pagination Helpers ───────────────────────────────────────────────────────

export function getPagination(page = "1", limit = "10") {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;
  return { page: pageNum, limit: limitNum, skip };
}

export function paginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  };
}

// Auto Priority Detector

export function detectPriority(title: string, description: string): Priority {
  const text = `${title} ${description}`.toLowerCase();
  const urgentKeywords = [
    "urgent",
    "asap",
    "emergency",
    "critical",
    "fire",
    "danger",
    "immediate",
  ];
  const highKeywords = ["broken", "not working", "outage", "failure", "severe"];

  if (urgentKeywords.some((kw) => text.includes(kw))) return "Urgent";
  if (highKeywords.some((kw) => text.includes(kw))) return "High";
  return "Medium"; // default
} 