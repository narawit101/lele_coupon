import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, concertName, xHandle, postUrl, imageUrl } = await req.json();

    if (!userId || !concertName || !xHandle) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่องานและชื่อบัญชี X ให้ครบถ้วน" },
        { status: 400 }
      );
    }

    if (!postUrl && !imageUrl) {
      return NextResponse.json(
        { error: "กรุณาแนบลิงก์โพสต์ใน X หรือแนบรูปภาพหลักฐานรีวิว" },
        { status: 400 }
      );
    }

    const review = await prisma.reviewSubmission.create({
      data: {
        userId,
        concertName: concertName.trim(),
        xHandle: xHandle.trim().replace(/^@/, ""),
        postUrl: postUrl ? postUrl.trim() : null,
        imageUrl: imageUrl || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error: unknown) {
    console.error("Submit review error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
