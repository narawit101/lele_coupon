import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { getAdminFromRequest } from "@/lib/admin-auth";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "lele_admin_2026";

async function isAuthorized(req: NextRequest): Promise<boolean> {
  const admin = await getAdminFromRequest(req);
  if (admin) return true;
  const legacySecret = req.headers.get("x-admin-secret") || req.nextUrl.searchParams.get("secret");
  return legacySecret === ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10", 10)));
  const q = searchParams.get("q")?.trim() || "";
  const status = searchParams.get("status") || "ALL";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

  // Build where clause
  const where: Record<string, unknown> = {};

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (q) {
    where.OR = [
      { concertName: { contains: q, mode: "insensitive" } },
      { xHandle: { contains: q, mode: "insensitive" } },
      { user: { displayName: { contains: q, mode: "insensitive" } } },
      { user: { xHandle: { contains: q, mode: "insensitive" } } },
    ];
  }

  // Build orderBy
  let orderBy: Record<string, unknown> | Array<Record<string, unknown>> = { createdAt: "desc" };
  if (sortBy === "concertName") {
    orderBy = [{ concertName: sortOrder }, { createdAt: "desc" }];
  } else if (sortBy === "customer") {
    orderBy = [{ user: { displayName: sortOrder } }, { createdAt: "desc" }];
  } else if (sortBy === "status") {
    orderBy = [{ status: sortOrder }, { createdAt: "desc" }];
  } else if (sortBy === "createdAt") {
    orderBy = { createdAt: sortOrder };
  }

  const [reviews, total, pendingCount] = await Promise.all([
    prisma.reviewSubmission.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            xHandle: true,
            phone: true,
            stamps: true,
          },
        },
      },
    }),
    prisma.reviewSubmission.count({ where }),
    prisma.reviewSubmission.count({ where: { status: "PENDING" } }),
  ]);

  return NextResponse.json({
    reviews,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    pendingCount,
  });
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reviewId, action, rejectReason } = await req.json();

  if (!reviewId || !action) {
    return NextResponse.json({ error: "Missing reviewId or action" }, { status: 400 });
  }

  const review = await prisma.reviewSubmission.findUnique({
    where: { id: reviewId },
    include: { user: true },
  });

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  // Allow switching/reverting action even if review is not PENDING
  if (review.status === action) {
    return NextResponse.json({ error: "สถานะนี้ถูกตั้งค่าอยู่แล้ว" }, { status: 400 });
  }

  if (action === "REJECT") {
    const result = await prisma.$transaction(async (tx) => {
      // If was previously APPROVED, subtract 1 point back
      if (review.status === "APPROVED") {
        const newStamps = Math.max(0, review.user.stamps - 1);
        await tx.pointLog.create({
          data: {
            userId: review.userId,
            amount: -1,
            reason: `ปรับสถานะเป็นไม่อนุมัติ: ${review.concertName}`,
          },
        });
        await tx.user.update({
          where: { id: review.userId },
          data: { stamps: newStamps },
        });
      }

      const updated = await tx.reviewSubmission.update({
        where: { id: reviewId },
        data: {
          status: "REJECTED",
          rejectReason: rejectReason || "หลักฐานไม่ชัดเจน หรือไม่พบโพสต์ติดแฮชแท็ก",
        },
      });

      return updated;
    });

    return NextResponse.json({ success: true, review: result });
  }

  if (action === "APPROVE") {
    const result = await prisma.$transaction(async (tx) => {
      // Add 1 stamp
      const currentStamps = review.user.stamps + 1;

      await tx.pointLog.create({
        data: {
          userId: review.userId,
          amount: 1,
          reason: `อนุมัติรีวิว: ${review.concertName}`,
        },
      });

      await tx.user.update({
        where: { id: review.userId },
        data: {
          stamps: currentStamps,
        },
      });

      const updatedReview = await tx.reviewSubmission.update({
        where: { id: reviewId },
        data: { status: "APPROVED", rejectReason: null },
      });

      return { review: updatedReview, newPass: null, remainingStamps: currentStamps };
    });

    return NextResponse.json({ success: true, ...result });
  }

  if (action === "PENDING") {
    const result = await prisma.$transaction(async (tx) => {
      // If was previously APPROVED, take 1 point back
      if (review.status === "APPROVED") {
        const newStamps = Math.max(0, review.user.stamps - 1);
        await tx.pointLog.create({
          data: {
            userId: review.userId,
            amount: -1,
            reason: `ยกเลิกการอนุมัติกลับเป็นรอตรวจ: ${review.concertName}`,
          },
        });
        await tx.user.update({
          where: { id: review.userId },
          data: { stamps: newStamps },
        });
      }

      const updated = await tx.reviewSubmission.update({
        where: { id: reviewId },
        data: { status: "PENDING", rejectReason: null },
      });

      return updated;
    });

    return NextResponse.json({ success: true, review: result });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
