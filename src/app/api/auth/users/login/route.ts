import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createUserToken } from "@/lib/user-auth";

export async function POST(request: NextRequest) {
  try {
    const { line_id, name, image } = await request.json();

    if (!line_id) {
      return NextResponse.json(
        { message: "กรุณาระบุ line_id" },
        { status: 400 }
      );
    }

    // Check if user already exists and whether they have a custom uploaded avatar (Cloudinary)
    const existingUser = await prisma.user.findUnique({
      where: { lineId: line_id },
      select: { avatarUrl: true },
    });

    const hasCustomAvatar =
      Boolean(existingUser?.avatarUrl &&
        existingUser.avatarUrl.includes("res.cloudinary.com"));

    // Auto-register/upsert user with LINE profile (preserve custom avatar)
    const user = await prisma.user.upsert({
      where: { lineId: line_id },
      update: {
        ...(name && { displayName: name }),
        ...(!hasCustomAvatar && image && { avatarUrl: image }),
      },
      create: {
        lineId: line_id,
        displayName: name || "LELE Member",
        avatarUrl: image || null,
      },
      include: {
        passes: { orderBy: { createdAt: "desc" } },
        reviews: { orderBy: { createdAt: "desc" }, take: 10 },
        pointLogs: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    // Generate JWT Token
    const token = createUserToken(user.id, user.lineId);

    return NextResponse.json(
      {
        message: "เข้าสู่ระบบสำเร็จ",
        token,
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("User login error:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" },
      { status: 500 }
    );
  }
}
