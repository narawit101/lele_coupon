import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/user-auth";

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "5", 10));
    const category = searchParams.get("category") || "ALL";

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

    // Filter by Category
    const filteredActivities = allActivities.filter((item) => {
      if (category === "ALL" || !category) return true;

      if (category === "REVIEWS") {
        if (item.type === "REVIEW") return true;
        if (item.type === "POINT_LOG") {
          const r = item.log.reason;
          return r.includes("รีวิว") || r.includes("อนุมัติรีวิว");
        }
        return false;
      }

      if (category === "PASSES") {
        if (item.type === "POINT_LOG") {
          const r = item.log.reason;
          return (
            Boolean(item.log.pass) ||
            r.includes("แลกโปรโมชั่น") ||
            r.includes("ใช้สิทธิ์") ||
            r.toLowerCase().includes("pass")
          );
        }
        return false;
      }

      if (category === "TIER") {
        if (item.type === "POINT_LOG") {
          const r = item.log.reason;
          return r.startsWith("ปรับระดับสมาชิกเป็น") || r.includes("ระดับสมาชิก");
        }
        return false;
      }

      if (category === "POINTS") {
        if (item.type === "POINT_LOG") {
          const r = item.log.reason;
          const isReview = r.includes("รีวิว") || r.includes("อนุมัติรีวิว");
          const isPass =
            Boolean(item.log.pass) ||
            r.includes("แลกโปรโมชั่น") ||
            r.includes("ใช้สิทธิ์") ||
            r.toLowerCase().includes("pass");
          const isTier =
            r.startsWith("ปรับระดับสมาชิกเป็น") || r.includes("ระดับสมาชิก");
          return !isReview && !isPass && !isTier;
        }
        return false;
      }

      return true;
    });

    const total = filteredActivities.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const safePage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (safePage - 1) * limit;
    const paginated = filteredActivities.slice(startIndex, startIndex + limit);

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
