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

// GET /api/admin/promotions — List all promotions with redemption stats
export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10", 10)));
    const q = searchParams.get("q")?.trim() || "";
    const status = searchParams.get("status") || "ALL";
    const sortBy = searchParams.get("sortBy") || "";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const where: Record<string, unknown> = {};

    if (status === "ACTIVE") {
      where.isActive = true;
    } else if (status === "INACTIVE") {
      where.isActive = false;
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    let orderBy: Record<string, unknown> | Array<Record<string, unknown>> = [
      { isActive: "desc" },
      { points: "asc" },
    ];

    if (sortBy === "title") {
      orderBy = [{ title: sortOrder }, { createdAt: "desc" }];
    } else if (sortBy === "points") {
      orderBy = [{ points: sortOrder }, { createdAt: "desc" }];
    } else if (sortBy === "redeemed") {
      orderBy = [{ passes: { _count: sortOrder } }, { createdAt: "desc" }];
    } else if (sortBy === "status") {
      orderBy = [{ isActive: sortOrder }, { points: "asc" }];
    }

    const [promotions, total, activeCount] = await Promise.all([
      prisma.promotion.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: { passes: true },
          },
        },
      }),
      prisma.promotion.count({ where }),
      prisma.promotion.count({ where: { isActive: true } }),
    ]);

    return NextResponse.json({
      promotions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      activeCount,
    });
  } catch (error) {
    console.error("Admin list promotions error:", error);
    return NextResponse.json({ error: "Failed to fetch promotions" }, { status: 500 });
  }
}

// POST /api/admin/promotions — Create promotion
export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, points, description, isActive } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "กรุณาระบุชื่อโปรโมชั่น" }, { status: 400 });
    }

    const pointsNum = parseInt(points, 10);
    if (isNaN(pointsNum) || pointsNum < 1) {
      return NextResponse.json({ error: "จำนวนแต้มต้องเป็นตัวเลขมากกว่า 0" }, { status: 400 });
    }

    const promotion = await prisma.promotion.create({
      data: {
        title: title.trim(),
        points: pointsNum,
        description: description?.trim() || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, promotion }, { status: 201 });
  } catch (error) {
    console.error("Admin create promotion error:", error);
    return NextResponse.json({ error: "Failed to create promotion" }, { status: 500 });
  }
}

// PATCH /api/admin/promotions — Update or toggle promotion
export async function PATCH(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, title, points, description, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Promotion ID required" }, { status: 400 });
    }

    const updateData: {
      title?: string;
      points?: number;
      description?: string | null;
      isActive?: boolean;
    } = {};

    if (title !== undefined) updateData.title = title.trim();
    if (points !== undefined) {
      const p = parseInt(points, 10);
      if (!isNaN(p) && p > 0) updateData.points = p;
    }
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const promotion = await prisma.promotion.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, promotion });
  } catch (error) {
    console.error("Admin update promotion error:", error);
    return NextResponse.json({ error: "Failed to update promotion" }, { status: 500 });
  }
}

// DELETE /api/admin/promotions — Delete promotion
export async function DELETE(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Promotion ID required" }, { status: 400 });
    }

    await prisma.promotion.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "ลบโปรโมชั่นเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("Admin delete promotion error:", error);
    return NextResponse.json({ error: "Failed to delete promotion" }, { status: 500 });
  }
}
