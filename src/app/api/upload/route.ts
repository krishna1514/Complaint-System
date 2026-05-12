import { NextRequest } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth-route";
import { errorResponse, successResponse } from "@/lib/helpers";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUserFromRequest(req);
    if (!user) return errorResponse("Unauthorized", 401);

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return errorResponse("No file", 400);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "scrrs_complaints" }, (err, res) => {
          if (err) reject(err);
          else resolve(res);
        })
        .end(buffer);
    });

    return successResponse(
      { url: (result as any).secure_url },
      "Upload successful",
    );
  } catch (error) {
    return errorResponse("Upload failed", 500);
  }
}