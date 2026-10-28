import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as "reviews" | "users" | "admins") || "reviews";

    if (!file) {
      return NextResponse.json({ error: "ไม่พบไฟล์ที่ต้องการอัปโหลด" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "ไฟล์ต้องเป็นรูปภาพเท่านั้น" }, { status: 400 });
    }

    // Limit 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "ขนาดรูปภาพต้องไม่เกิน 10MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadToCloudinary(buffer, type);

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error: unknown) {
    console.error("Cloudinary upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
