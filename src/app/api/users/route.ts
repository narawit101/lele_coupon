import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "lele_ticket_jwt_secret_2026";

function getUserIdFromToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { user_id: string };
    return decoded.user_id || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        passes: { orderBy: { createdAt: "desc" } },
        reviews: { orderBy: { createdAt: "desc" }, take: 10 },
        pointLogs: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { xHandle, phone, avatarUrl } = await request.json();

    // If updating avatarUrl, delete the previous image from Cloudinary to save storage
    if (avatarUrl !== undefined) {
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatarUrl: true },
      });
      if (
        existingUser?.avatarUrl &&
        existingUser.avatarUrl !== avatarUrl &&
        existingUser.avatarUrl.includes("res.cloudinary.com")
      ) {
        deleteFromCloudinary(existingUser.avatarUrl).catch((err) =>
          console.error("Failed to delete old user avatar:", err)
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(xHandle !== undefined && { xHandle: xHandle ? xHandle.trim().replace(/^@/, "") : null }),
        ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
        ...(avatarUrl !== undefined && { avatarUrl: avatarUrl ? avatarUrl.trim() : null }),
      },
      include: {
        passes: { orderBy: { createdAt: "desc" } },
        reviews: { orderBy: { createdAt: "desc" }, take: 10 },
        pointLogs: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
