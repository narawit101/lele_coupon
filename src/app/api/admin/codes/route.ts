import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/admin-auth";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "lele_admin_2026";

async function isAuthorized(req: NextRequest): Promise<boolean> {
  const admin = await getAdminFromRequest(req);
  if (admin) return true;
  const legacySecret =
    req.headers.get("x-admin-secret") || req.nextUrl.searchParams.get("secret");
  return legacySecret === ADMIN_SECRET;
}

// GET /api/admin/codes — List all special codes and recent redemption logs
export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = req.nextUrl;
    const q = searchParams.get("q")?.trim() || "";

    const codeWhere: Record<string, unknown> = {};
    if (q) {
      codeWhere.OR = [
        { code: { contains: q, mode: "insensitive" } },
        { rewardTitle: { contains: q, mode: "insensitive" } },
      ];
    }

    const [codes, redemptions] = await Promise.all([
      prisma.specialCode.findMany({
        where: codeWhere,
        orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
        include: {
          _count: {
            select: { redemptions: true },
          },
        },
      }),
      prisma.codeRedemption.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
        include: {
          code: {
            select: {
              code: true,
              rewardType: true,
              rewardTitle: true,
              rewardPoints: true,
            },
          },
          user: {
            select: {
              id: true,
              displayName: true,
              xHandle: true,
              avatarUrl: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      codes,
      redemptions,
    });
  } catch (error) {
    console.error("Fetch admin codes error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการโหลดข้อมูลโค้ด" },
      { status: 500 }
    );
  }
}

// POST /api/admin/codes — Create a new special code
export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      code,
      rewardType,
      rewardPoints,
      rewardTitle,
      maxUses,
      expiresAt,
    } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { error: "กรุณาระบุรหัสโค้ดพิเศษ" },
        { status: 400 }
      );
    }

    const normalizedCode = code.trim().toUpperCase();

    if (!rewardType || (rewardType !== "PASS" && rewardType !== "POINTS")) {
      return NextResponse.json(
        { error: "กรุณาเลือกประเภทของรางวัล (อื่นๆ หรือ แต้มสะสม)" },
        { status: 400 }
      );
    }

    if (rewardType === "POINTS") {
      const pts = parseInt(rewardPoints, 10);
      if (isNaN(pts) || pts <= 0) {
        return NextResponse.json(
          { error: "กรุณาระบุจำนวนแต้มสะสมอย่างน้อย 1 แต้ม" },
          { status: 400 }
        );
      }
    }

    if (!rewardTitle || typeof rewardTitle !== "string" || !rewardTitle.trim()) {
      return NextResponse.json(
        { error: "กรุณาระบุชื่อของรางวัล" },
        { status: 400 }
      );
    }

    // Check existing code
    const existing = await prisma.specialCode.findUnique({
      where: { code: normalizedCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: `รหัสโค้ด "${normalizedCode}" มีอยู่ในระบบแล้ว กรุณาใช้รหัสอื่น` },
        { status: 400 }
      );
    }

    const parsedMaxUses =
      maxUses !== undefined && maxUses !== null && maxUses !== ""
        ? Math.max(1, parseInt(maxUses, 10))
        : null;

    const parsedExpiresAt = expiresAt ? new Date(expiresAt) : null;

    const newCode = await prisma.specialCode.create({
      data: {
        code: normalizedCode,
        rewardType,
        rewardPoints: rewardType === "POINTS" ? parseInt(rewardPoints, 10) : null,
        rewardTitle: rewardTitle.trim(),
        maxUses: parsedMaxUses,
        expiresAt: parsedExpiresAt,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `สร้างรหัสโค้ดพิเศษ "${normalizedCode}" เรียบร้อยแล้ว`,
      code: newCode,
    });
  } catch (error) {
    console.error("Create code error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างโค้ด" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/codes — Update code status or settings
export async function PATCH(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { codeId, code, rewardType, rewardPoints, rewardTitle, isActive, maxUses, expiresAt } = body;

    if (!codeId) {
      return NextResponse.json(
        { error: "ไม่พบรหัสโค้ดที่ต้องการอัปเดต" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (code && typeof code === "string") {
      const cleanCode = code.trim().toUpperCase();
      const existing = await prisma.specialCode.findFirst({
        where: { code: cleanCode, id: { not: codeId } },
      });
      if (existing) {
        return NextResponse.json(
          { error: `รหัสโค้ด "${cleanCode}" มีอยู่ในระบบแล้ว` },
          { status: 400 }
        );
      }
      updateData.code = cleanCode;
    }

    if (rewardTitle && typeof rewardTitle === "string") {
      updateData.rewardTitle = rewardTitle.trim();
    }

    if (rewardType && (rewardType === "PASS" || rewardType === "POINTS")) {
      updateData.rewardType = rewardType;
      if (rewardType === "POINTS") {
        updateData.rewardPoints = rewardPoints ? Math.max(1, parseInt(rewardPoints, 10)) : 1;
      } else {
        updateData.rewardPoints = null;
      }
    }

    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    if (maxUses !== undefined) {
      updateData.maxUses =
        maxUses === null || maxUses === "" ? null : Math.max(1, parseInt(maxUses, 10));
    }

    if (expiresAt !== undefined) {
      updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }

    const updated = await prisma.specialCode.update({
      where: { id: codeId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      code: updated,
      message: "อัปเดตข้อมูลโค้ดเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Update code error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปเดตโค้ด" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/codes — Delete code
export async function DELETE(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = req.nextUrl;
    const codeId = searchParams.get("codeId");

    if (!codeId) {
      return NextResponse.json(
        { error: "ไม่พบรหัสโค้ดที่ต้องการลบ" },
        { status: 400 }
      );
    }

    const target = await prisma.specialCode.findUnique({
      where: { id: codeId },
    });

    if (!target) {
      return NextResponse.json(
        { error: "ไม่พบโค้ดนี้ในระบบ" },
        { status: 404 }
      );
    }

    await prisma.specialCode.delete({
      where: { id: codeId },
    });

    return NextResponse.json({
      success: true,
      message: `ลบโค้ด "${target.code}" เรียบร้อยแล้ว`,
    });
  } catch (error) {
    console.error("Delete code error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบโค้ด" },
      { status: 500 }
    );
  }
}
