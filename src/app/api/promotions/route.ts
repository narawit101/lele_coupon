import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/user-auth";

// GET /api/promotions — List active promotions with quotas & user limit status
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);

    const promotions = await prisma.promotion.findMany({
      where: { isActive: true },
      include: {
        passes: {
          select: { id: true, userId: true },
        },
      },
      orderBy: { points: "asc" },
    });

    const now = Date.now();
    const mapped = promotions.map((promo) => {
      const redeemedCount = promo.passes.length;
      const remainingQuota = promo.quota !== null ? Math.max(0, promo.quota - redeemedCount) : null;
      const userRedeemedCount = userId ? promo.passes.filter((p) => p.userId === userId).length : 0;
      const userRemainingQuota = promo.maxPerUser !== null ? Math.max(0, promo.maxPerUser - userRedeemedCount) : null;
      const isExpired = promo.expiresAt ? new Date(promo.expiresAt).getTime() < now : false;

      let canRedeem = true;
      let reasonDisabled: string | undefined = undefined;

      if (isExpired) {
        canRedeem = false;
        reasonDisabled = "สิ้นสุด";
      } else if (remainingQuota !== null && remainingQuota <= 0) {
        canRedeem = false;
        reasonDisabled = "สิทธิ์หมด";
      } else if (userRemainingQuota !== null && userRemainingQuota <= 0) {
        canRedeem = false;
        reasonDisabled = "แลกครบสิทธิ์แล้ว";
      }

      return {
        id: promo.id,
        title: promo.title,
        points: promo.points,
        description: promo.description,
        quota: promo.quota,
        maxPerUser: promo.maxPerUser,
        expiresAt: promo.expiresAt ? promo.expiresAt.toISOString() : null,
        isActive: promo.isActive,
        createdAt: promo.createdAt.toISOString(),
        redeemedCount,
        remainingQuota,
        userRedeemedCount,
        userRemainingQuota,
        isExpired,
        canRedeem,
        reasonDisabled,
      };
    });

    return NextResponse.json({ promotions: mapped });
  } catch (error) {
    console.error("Fetch promotions error:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการโหลดโปรโมชั่น" },
      { status: 500 }
    );
  }
}
