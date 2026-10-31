import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/user-auth";

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ message: "กรุณาเข้าสู่ระบบก่อนทำรายการ" }, { status: 401 });
    }

    const { promotionId, quantity: rawQuantity } = await request.json();
    if (!promotionId) {
      return NextResponse.json({ message: "กรุณาระบุโปรโมชั่นที่ต้องการแลก" }, { status: 400 });
    }

    const quantity = Math.max(1, Math.floor(Number(rawQuantity) || 1));

    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
    });

    if (!promotion || !promotion.isActive) {
      return NextResponse.json({ message: "โปรโมชั่นนี้ไม่พร้อมใช้งานหรือถูกปิดแล้ว" }, { status: 404 });
    }

    if (promotion.expiresAt && new Date(promotion.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ message: "โปรโมชั่นนี้สิ้นสุดระยะเวลาแลกแล้ว" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "ไม่พบข้อมูลสมาชิก" }, { status: 404 });
    }

    const totalPoints = promotion.points * quantity;

    if (user.stamps < totalPoints) {
      return NextResponse.json(
        { message: `แต้มสะสมไม่เพียงพอ (ต้องการ ${totalPoints} แต้ม แต่คุณมี ${user.stamps} แต้ม)` },
        { status: 400 }
      );
    }

    // Process redemption in transaction with atomic quota validation
    const result = await prisma.$transaction(async (tx) => {
      // Validate total quota
      if (promotion.quota !== null) {
        const totalRedeemed = await tx.queuePass.count({
          where: { promotionId: promotion.id },
        });
        const remaining = promotion.quota - totalRedeemed;
        if (remaining <= 0) {
          throw new Error("สิทธิ์โปรโมชั่นนี้ถูกแลกครบเต็มโควตาแล้ว");
        }
        if (quantity > remaining) {
          throw new Error(`สิทธิ์โปรโมชั่นนี้เหลือเพียง ${remaining} สิทธิ์ (คุณเลือก ${quantity} สิทธิ์)`);
        }
      }

      // Validate per-user quota
      if (promotion.maxPerUser !== null) {
        const userRedeemed = await tx.queuePass.count({
          where: { promotionId: promotion.id, userId: user.id },
        });
        const remainingForUser = promotion.maxPerUser - userRedeemed;
        if (remainingForUser <= 0) {
          throw new Error(`คุณได้แลกสิทธิ์โปรโมชั่นนี้ครบโควตาแล้ว (จำกัดคนละ ${promotion.maxPerUser} สิทธิ์)`);
        }
        if (quantity > remainingForUser) {
          throw new Error(`คุณสามารถแลกได้อีกเพียง ${remainingForUser} สิทธิ์ (จำกัดคนละ ${promotion.maxPerUser} สิทธิ์)`);
        }
      }

      const remainingStamps = user.stamps - totalPoints;

      // Generate clean random codes e.g. LELE-RW-9K2F
      const createdPasses = [];
      const randomCodes = [];

      for (let i = 0; i < quantity; i++) {
        const randomCode = `LELE-RW-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        randomCodes.push(randomCode);

        const newPass = await tx.queuePass.create({
          data: {
            code: randomCode,
            userId: user.id,
            promotionId: promotion.id,
            rewardTitle: promotion.title,
            status: "ACTIVE",
          },
        });
        createdPasses.push(newPass);
      }

      await tx.pointLog.create({
        data: {
          userId: user.id,
          amount: -totalPoints,
          reason:
            quantity > 1
              ? `แลกโปรโมชั่น: ${promotion.title} (${quantity} สิทธิ์)`
              : `แลกโปรโมชั่น: ${promotion.title} (รหัส ${randomCodes[0]})`,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { stamps: remainingStamps },
        include: {
          passes: { orderBy: { createdAt: "desc" } },
          reviews: { orderBy: { createdAt: "desc" }, take: 10 },
          pointLogs: { orderBy: { createdAt: "desc" }, take: 10 },
        },
      });

      return { passes: createdPasses, pass: createdPasses[0], user: updatedUser };
    });

    return NextResponse.json({
      success: true,
      message:
        quantity > 1
          ? `แลกโปรโมชั่น "${promotion.title}" จำนวน ${quantity} สิทธิ์ สำเร็จ!`
          : `แลกโปรโมชั่น "${promotion.title}" สำเร็จ!`,
      passes: result.passes,
      pass: result.pass,
      user: result.user,
    });
  } catch (error: unknown) {
    console.error("Redeem promotion error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการแลกโปรโมชั่น";
    return NextResponse.json({ message: errorMessage }, { status: 400 });
  }
}
