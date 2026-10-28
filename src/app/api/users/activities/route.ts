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

    const [reviews, pointLogs, passes, redemptions] = await Promise.all([
      prisma.reviewSubmission.findMany({
        where: {
          userId,
          status: { in: ["PENDING", "REJECTED"] },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.pointLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.queuePass.findMany({
        where: { userId },
      }),
      prisma.codeRedemption.findMany({
        where: { userId, passId: { not: null } },
        include: { code: true },
      }),
    ]);

    const pointLogsWithPass = pointLogs.map((l) => {
      let matchedPass = passes.find((p) =>
        l.reason.toUpperCase().includes(p.code.toUpperCase())
      );

      if (!matchedPass) {
        const matchedRedemption = redemptions.find((r) =>
          l.reason.toUpperCase().includes(r.code.code.toUpperCase())
        );
        if (matchedRedemption?.passId) {
          matchedPass = passes.find((p) => p.id === matchedRedemption.passId);
        }
      }

      return {
        ...l,
        pass: matchedPass
          ? {
              code: matchedPass.code,
              status: matchedPass.status,
              usedForConcert: matchedPass.usedForConcert,
              usedAt: matchedPass.usedAt ? matchedPass.usedAt.toISOString() : null,
            }
          : null,
      };
    });

    const allActivities = [
      ...reviews.map((r) => ({
        type: "REVIEW" as const,
        id: `rev-${r.id}`,
        date: r.createdAt.toISOString(),
        review: r,
      })),
      ...pointLogsWithPass.map((l) => ({
        type: "POINT_LOG" as const,
        id: `log-${l.id}`,
        date: l.createdAt.toISOString(),
        log: l,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const total = allActivities.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const safePage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (safePage - 1) * limit;
    const paginated = allActivities.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      activities: paginated,
      total,
      page: safePage,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("Get user activities error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
