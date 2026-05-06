import { NextRequest } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth-route";
import { connectDB } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/helpers";
import Complaint from "@/models/Complaint";
import Feedback from "@/models/Feedback";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authUser = getCurrentUserFromRequest(req);
  if (!authUser) return errorResponse("Unauthorized", 401);

  const { id } = await params;
  const { rating, comment } = await req.json();
  if (!rating || rating < 1 || rating > 5)
    return errorResponse("Rating must be 1-5");

  await connectDB();
  const complaint = await Complaint.findById(id);
  if (!complaint) return errorResponse("Complaint not found");
  if (complaint.submittedBy.toString() !== authUser.id)
    return errorResponse("Not your complaint");
  if (complaint.status !== "Resolved")
    return errorResponse("Can only rate resolved complaints");

  const existing = await Feedback.findOne({ complaintId: id });
  if (existing) return errorResponse("Feedback already submitted");

  await Feedback.create({
    complaintId: id,
    userId: authUser.id,
    rating,
    comment,
  });
  return successResponse(null, "Thank you for your feedback");
}
