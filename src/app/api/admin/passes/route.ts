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
  const code = searchParams.get("code");

  if (code) {
    const pass = await prisma.queuePass.findUnique({
      where: { code: code.trim().toUpperCase() },
      include: {
        user: { select: { displayName: true, xHandle: true, phone: true } },
      },
    });
    return NextResponse.json({ pass });
  }

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10", 10)));
  const q = searchParams.get("q")?.trim() || "";
  const status = searchParams.get("status") || "ALL";
  const sortBy = searchParams.get("sortBy") || "";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

  const where: Record<string, unknown> = {};

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (q) {
    where.OR = [
      { code: { contains: q, mode: "insensitive" } },
      { rewardTitle: { contains: q, mode: "insensitive" } },
      { usedForConcert: { contains: q, mode: "insensitive" } },
      { user: { displayName: { contains: q, mode: "insensitive" } } },
      { user: { xHandle: { contains: q, mode: "insensitive" } } },
      { user: { phone: { contains: q } } },
    ];
  }

  let orderBy: Record<string, unknown> | Array<Record<string, unknown>> = {
    createdAt: "desc",
  };

  if (sortBy === "code") {
    orderBy = [{ code: sortOrder }, { createdAt: "desc" }];
  } else if (sortBy === "reward") {
    orderBy = [{ rewardTitle: sortOrder }, { createdAt: "desc" }];
  } else if (sortBy === "customer") {
    orderBy = [{ user: { displayName: sortOrder } }, { createdAt: "desc" }];
  } else if (sortBy === "createdAt") {
    orderBy = { createdAt: sortOrder };
  } else if (sortBy === "status") {
    orderBy = [{ status: sortOrder }, { createdAt: "desc" }];
  }

  const [passes, total, activeCount, usedCount] = await Promise.all([
    prisma.queuePass.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { displayName: true, xHandle: true, phone: true } },
      },
    }),
    prisma.queuePass.count({ where }),
    prisma.queuePass.count({ where: { status: "ACTIVE" } }),
    prisma.queuePass.count({ where: { status: "USED" } }),
  ]);

  return NextResponse.json({
    passes,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    activeCount,
    usedCount,
  });
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code, concertName, action } = await req.json();

  if (!code) {
    return NextResponse.json({ error: "กรุณาระบุรหัสสิทธิ์ลัดคิว" }, { status: 400 });
  }

  const pass = await prisma.queuePass.findUnique({
    where: { code: code.trim().toUpperCase() },
    include: { user: true },
  });

  if (!pass) {
    return NextResponse.json({ error: "ไม่พบรหัสสิทธิ์ลัดคิวนี้ในระบบ" }, { status: 404 });
  }

  // Toggle or action-based update
  if (action === "REVERT" || (action === undefined && pass.status === "USED")) {
    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.queuePass.update({
        where: { id: pass.id },
        data: {
          status: "ACTIVE",
          usedAt: null,
          usedForConcert: null,
        },
      });

      await tx.pointLog.create({
        data: {
          userId: pass.userId,
          amount: 0,
          reason: `ยกเลิกการใช้สิทธิ์: ${pass.rewardTitle || "สิทธิ์ลัดคิว"} (รหัส ${pass.code})`,
        },
      });

      return p;
    });

    return NextResponse.json({
      success: true,
      pass: updated,
      message: `ยกเลิกการตัดสิทธิ์รหัส ${pass.code} สำเร็จ (กลับเป็นยังไม่ใช้งาน)`,
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const p = await tx.queuePass.update({
      where: { id: pass.id },
      data: {
        status: "USED",
        usedAt: new Date(),
        usedForConcert: concertName || "ไม่ระบุชื่องาน",
      },
    });

    await tx.pointLog.create({
      data: {
        userId: pass.userId,
        amount: 0,
        reason: `ใช้สิทธิ์ลัดคิว: ${pass.rewardTitle || "สิทธิ์ลัดคิว"} (รหัส ${pass.code})`,
      },
    });

    return p;
  });

  return NextResponse.json({
    success: true,
    pass: updated,
    message: `ตัดสิทธิ์ลัดคิวรหัส ${pass.code} ให้คุณ ${pass.user.displayName} สำเร็จ`,
  });
}
