import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "5", 10));
    const status = searchParams.get("status") || "ALL";

    const where: { userId: string; status?: "ACTIVE" | "USED" } = { userId };
    if (status === "ACTIVE" || status === "USED") {
      where.status = status;
    }

    const [passes, total, activeCount, usedCount, allCount] = await Promise.all([
      prisma.queuePass.findMany({
        where,
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.queuePass.count({ where }),
      prisma.queuePass.count({ where: { userId, status: "ACTIVE" } }),
      prisma.queuePass.count({ where: { userId, status: "USED" } }),
      prisma.queuePass.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      passes,
      total,
      page,
      limit,
      totalPages,
      counts: {
        all: allCount,
        active: activeCount,
        used: usedCount,
      },
    });
  } catch (error) {
    console.error("Get user passes error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
