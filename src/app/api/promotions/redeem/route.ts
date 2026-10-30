import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/user-auth";

export async function POST(request: NextRequest) {
  try {
      const userId = getUserIdFromRequest(request);
      if (!userId) {
        return NextResponse.json({ message: "กรุณาเข้าสู่ระบบก่อนทำรายการ" }, { status: 401 });
      }

      const { promotionId } = await request.json();
      if (!promotionId) {
        return NextResponse.json({ message: "กรุณาระบุโปรโมชั่นที่ต้องการแลก" }, { status: 400 });
      }

      const promotion = await prisma.promotion.findUnique({
        where: { id: promotionId },
      });

      if (!promotion || !promotion.isActive) {
        return NextResponse.json({ message: "โปรโมชั่นนี้ไม่พร้อมใช้งานหรือถูกปิดแล้ว" }, { status: 404 });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return NextResponse.json({ message: "ไม่พบข้อมูลสมาชิก" }, { status: 404 });
      }

      if (user.stamps < promotion.points) {
        return NextResponse.json(
          { message: `แต้มสะสมไม่เพียงพอ (ต้องการ ${promotion.points} แต้ม แต่คุณมี ${user.stamps} แต้ม)` },
          { status: 400 }
        );
      }

      // Process redemption in transaction
      const result = await prisma.$transaction(async (tx) => {
        const remainingStamps = user.stamps - promotion.points;

        // Generate clean random code e.g. LELE-RW-9K2F
        const randomCode = `LELE-RW-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        const newPass = await tx.queuePass.create({
          data: {
            code: randomCode,
            userId: user.id,
            promotionId: promotion.id,
            rewardTitle: promotion.title,
            status: "ACTIVE",
          },
        });

        await tx.pointLog.create({
          data: {
            userId: user.id,
            amount: -promotion.points,
            reason: `แลกโปรโมชั่น: ${promotion.title} (รหัส ${randomCode})`,
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

        return { pass: newPass, user: updatedUser };
      });

      return NextResponse.json({
        success: true,
        message: `แลกโปรโมชั่น "${promotion.title}" สำเร็จ!`,
        pass: result.pass,
        user: result.user,
      });
    } catch (error) {
      console.error("Redeem promotion error:", error);
      return NextResponse.json({ message: "เกิดข้อผิดพลาดในการแลกโปรโมชั่น" }, { status: 500 });
    }
  }
