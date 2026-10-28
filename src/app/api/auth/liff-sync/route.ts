import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { lineId, displayName, avatarUrl, xHandle, phone } = await req.json();

    if (!lineId || !displayName) {
      return NextResponse.json({ error: "Missing lineId or displayName" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { lineId },
      select: { avatarUrl: true },
    });

    const hasCustomAvatar =
      Boolean(existingUser?.avatarUrl &&
      existingUser.avatarUrl.includes("res.cloudinary.com"));

    // ponytail: Single-step upsert avoids roundtrips and separate registration flow
    const user = await prisma.user.upsert({
      where: { lineId },
      update: {
        displayName,
        ...(!hasCustomAvatar && avatarUrl && { avatarUrl }),
        ...(xHandle && { xHandle }),
        ...(phone && { phone }),
      },
      create: {
        lineId,
        displayName,
        avatarUrl: avatarUrl || null,
        xHandle: xHandle || null,
        phone: phone || null,
      },
      include: {
        passes: {
          orderBy: { createdAt: "desc" },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        pointLogs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    return NextResponse.json({ user });
  } catch (error: unknown) {
    console.error("LIFF sync error:", error);
    return NextResponse.json({ error: "Database sync failed" }, { status: 500 });
  }
}
