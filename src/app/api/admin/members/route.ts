import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMemberTier } from "@/lib/tier";
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
  const query = searchParams.get("q")?.trim() || "";
  const status = searchParams.get("status") || "ALL";
  const tier = searchParams.get("tier") || "ALL";
  const sortBy = searchParams.get("sortBy") || "";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

  const [customersTotal, adminsTotal] = await Promise.all([
    prisma.user.count(),
    prisma.admin.count(),
  ]);

  // If status is ADMIN, query from prisma.admin
  if (status === "ADMIN") {
    const adminWhere: Record<string, unknown> = {};
    if (query) {
      adminWhere.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ];
    }

    let adminOrderBy: Record<string, unknown> | Array<Record<string, unknown>> = { createdAt: "desc" };
    if (sortBy === "displayName") {
      adminOrderBy = [{ name: sortOrder }, { createdAt: "desc" }];
    } else if (sortBy === "xHandle") {
      adminOrderBy = [{ email: sortOrder }, { createdAt: "desc" }];
    }

    const [admins, total] = await Promise.all([
      prisma.admin.findMany({
        where: adminWhere,
        orderBy: adminOrderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.admin.count({ where: adminWhere }),
    ]);

    const formattedAdmins = admins.map((a) => ({
      id: a.id,
      displayName: a.name,
      avatarUrl: a.avatarUrl,
      xHandle: a.email,
      phone: a.role,
      stamps: 0,
      createdAt: a.createdAt,
      isAdmin: true,
      role: a.role,
      _count: { reviews: 0, passes: 0 },
    }));

    return NextResponse.json({
      members: formattedAdmins,
      total,
      customersTotal,
      adminsTotal,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  }

  // Otherwise, query customers from prisma.user
  const where: Record<string, unknown> = {};

  if (query) {
    where.OR = [
      { id: { contains: query, mode: "insensitive" } },
      { displayName: { contains: query, mode: "insensitive" } },
      { xHandle: { contains: query, mode: "insensitive" } },
      { phone: { contains: query } },
      { lineId: { contains: query, mode: "insensitive" } },
    ];
  }

  if (tier && tier !== "ALL") {
    if (tier === "DIAMOND") {
      where.OR = [{ tier: "DIAMOND" }, { tier: null, lifetimeStamps: { gte: 100 } }];
    } else if (tier === "PLATINUM") {
      where.OR = [{ tier: "PLATINUM" }, { tier: null, lifetimeStamps: { gte: 50, lt: 100 } }];
    } else if (tier === "GOLD") {
      where.OR = [{ tier: "GOLD" }, { tier: null, lifetimeStamps: { gte: 25, lt: 50 } }];
    } else if (tier === "SILVER") {
      where.OR = [{ tier: "SILVER" }, { tier: null, lifetimeStamps: { gte: 10, lt: 25 } }];
    } else if (tier === "BRONZE") {
      where.OR = [{ tier: "BRONZE" }, { tier: null, lifetimeStamps: { lt: 10 } }];
    } else {
      where.tier = tier;
    }
  }

  let orderBy: Record<string, unknown> | Array<Record<string, unknown>> = { createdAt: "desc" };
  if (sortBy === "displayName") {
    orderBy = [{ displayName: sortOrder }, { createdAt: "desc" }];
  } else if (sortBy === "xHandle") {
    orderBy = [{ xHandle: sortOrder }, { createdAt: "desc" }];
  } else if (sortBy === "stamps") {
    orderBy = [{ stamps: sortOrder }, { createdAt: "desc" }];
  } else if (sortBy === "passes") {
    orderBy = [{ passes: { _count: sortOrder } }, { createdAt: "desc" }];
  }

  const [members, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        passes: true,
        _count: { select: { reviews: true, passes: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const formattedMembers = members.map((m) => ({
    ...m,
    isAdmin: false,
  }));

  return NextResponse.json({
    members: formattedMembers,
    total,
    customersTotal,
    adminsTotal,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, amount = 0, reason, tier } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (typeof amount === "number" && amount < 0 && user.stamps + amount < 0) {
    return NextResponse.json(
      { error: `ไม่สามารถลดแต้มเกินจำนวนที่มีอยู่ได้ (ปัจจุบันมี ${user.stamps} แต้ม)` },
      { status: 400 }
    );
  }

  const safeAmount = typeof amount === "number" ? amount : 0;
  const newStamps = Math.max(0, user.stamps + safeAmount);
  const lifetimeInc = safeAmount > 0 ? safeAmount : 0;
  const currentTierRaw = user.tier || "AUTO";
  const requestedTierRaw = tier !== undefined && tier !== null ? String(tier).toUpperCase() : currentTierRaw;
  const isTierChanging = requestedTierRaw !== currentTierRaw;

  const isAuto = requestedTierRaw === "AUTO";
  const newTierValue = isAuto ? null : requestedTierRaw;
  const tierUpdate = isTierChanging ? { tier: newTierValue } : {};
  const tierConfig = !isAuto ? getMemberTier(newTierValue) : null;

  const [updatedUser] = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: userId },
      data: {
        stamps: newStamps,
        ...(lifetimeInc > 0 ? { lifetimeStamps: { increment: lifetimeInc } } : {}),
        ...tierUpdate,
      },
    });

    if (isTierChanging) {
      const cleanReason =
        reason &&
        typeof reason === "string" &&
        reason.trim() &&
        reason.trim() !== "ปรับระดับสมาชิกโดยแอดมิน"
          ? reason.trim()
          : null;
      const targetLabel = isAuto
        ? "อัตโนมัติ (ตามแต้มสะสม)"
        : tierConfig
        ? tierConfig.label
        : requestedTierRaw;
      const logReason = `ปรับระดับสมาชิกเป็น ${targetLabel}${
        cleanReason ? ` [หมายเหตุ: ${cleanReason}]` : ""
      }`;

      await tx.pointLog.create({
        data: {
          userId: user.id,
          amount: safeAmount,
          reason: logReason,
        },
      });
    } else if (safeAmount !== 0) {
      await tx.pointLog.create({
        data: {
          userId: user.id,
          amount: safeAmount,
          reason: reason || "ปรับแต้มโดยแอดมิน",
        },
      });
    }

    return [updated];
  });

  return NextResponse.json({ success: true, user: updatedUser });
}

export async function PATCH(req: NextRequest) {
  const currentAdmin = await getAdminFromRequest(req);
  if (!currentAdmin && !(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { adminId, name } = await req.json();
  if (!adminId || !name?.trim()) {
    return NextResponse.json(
      { error: "กรุณาระบุชื่อที่ต้องการแก้ไข" },
      { status: 400 }
    );
  }

  const targetAdmin = await prisma.admin.findUnique({
    where: { id: adminId },
  });
  if (!targetAdmin) {
    return NextResponse.json(
      { error: "ไม่พบบัญชีแอดมินที่ต้องการแก้ไข" },
      { status: 404 }
    );
  }

  // ห้าม admin แก้ไขชื่อ dev
  if (targetAdmin.role === "DEV" && currentAdmin?.role !== "DEV") {
    return NextResponse.json(
      { error: "ไม่อนุญาตให้แก้ไขชื่อบัญชี Developer" },
      { status: 403 }
    );
  }

  const updated = await prisma.admin.update({
    where: { id: adminId },
    data: { name: name.trim() },
  });

  return NextResponse.json({ success: true, admin: updated });
}

export async function DELETE(req: NextRequest) {
  const currentAdmin = await getAdminFromRequest(req);
  if (!currentAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const adminId = searchParams.get("adminId");

  if (!adminId) {
    return NextResponse.json(
      { error: "ไม่พบรหัสแอดมินที่ต้องการลบ" },
      { status: 400 }
    );
  }

  // 1. Cannot delete self
  if (currentAdmin.id === adminId) {
    return NextResponse.json(
      { error: "ไม่สามารถลบบัญชีของตัวเองได้" },
      { status: 400 }
    );
  }

  // 2. Check target admin
  const targetAdmin = await prisma.admin.findUnique({
    where: { id: adminId },
  });
  if (!targetAdmin) {
    return NextResponse.json(
      { error: "ไม่พบบัญชีแอดมินในระบบ" },
      { status: 404 }
    );
  }

  // 3. Dev is highest role: DEV cannot be deleted
  if (targetAdmin.role === "DEV") {
    return NextResponse.json(
      { error: "ไม่สามารถลบบัญชี Developer ได้" },
      { status: 403 }
    );
  }

  // 4. Only DEV or OWNER can delete admins
  if (currentAdmin.role !== "DEV" && currentAdmin.role !== "OWNER") {
    return NextResponse.json(
      { error: "เฉพาะ Developer หรือ Owner เท่านั้นที่สามารถลบแอดมินได้" },
      { status: 403 }
    );
  }

  await prisma.admin.delete({ where: { id: adminId } });

  return NextResponse.json({
    success: true,
    message: `ลบบัญชีแอดมิน ${targetAdmin.name} เรียบร้อยแล้ว`,
  });
}
