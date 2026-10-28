import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "lele_ticket_jwt_secret_2026";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "กรุณาเข้าสู่ระบบก่อนทำรายการ" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    let decoded: { user_id: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { user_id: string };
    } catch {
      return NextResponse.json(
        { message: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const rawCode = body.code;
    if (!rawCode || typeof rawCode !== "string" || !rawCode.trim()) {
      return NextResponse.json(
        { message: "กรุณาระบุรหัสโค้ดพิเศษ" },
        { status: 400 }
      );
    }

    const normalizedCode = rawCode.trim().toUpperCase();

    // 1. Find Special Code
    const specialCode = await prisma.specialCode.findUnique({
      where: { code: normalizedCode },
    });

    if (!specialCode) {
      return NextResponse.json(
        { message: "ไม่พบรหัสโค้ดนี้ในระบบ หรือรหัสไม่ถูกต้อง" },
        { status: 404 }
      );
    }

    // 2. Check active status
    if (!specialCode.isActive) {
      return NextResponse.json(
        { message: "รหัสโค้ดนี้ถูกปิดการใช้งาน" },
        { status: 400 }
      );
    }

    // 3. Check expiration
    if (specialCode.expiresAt && new Date() > specialCode.expiresAt) {
      return NextResponse.json(
        { message: "รหัสโค้ดนี้หมดอายุการใช้งานแล้ว" },
        { status: 400 }
      );
    }

    // 4. Check quota limit
    if (
      specialCode.maxUses !== null &&
      specialCode.usedCount >= specialCode.maxUses
    ) {
      return NextResponse.json(
        { message: "รหัสโค้ดนี้ถูกใช้งานครบตามจำนวนสิทธิ์แล้ว" },
        { status: 400 }
      );
    }

    // 5. Check if user already redeemed this code (1 per user constraint)
    const existingRedemption = await prisma.codeRedemption.findUnique({
      where: {
        codeId_userId: {
          codeId: specialCode.id,
          userId: decoded.user_id,
        },
      },
    });

    if (existingRedemption) {
      return NextResponse.json(
        { message: "คุณเคยใช้สิทธิ์โค้ดนี้ไปแล้ว (จำกัด 1 คนต่อ 1 โค้ด)" },
        { status: 400 }
      );
    }

    // 6. Execute atomic transaction to claim reward
    const result = await prisma.$transaction(async (tx) => {
      let createdPassId: string | null = null;
      let createdPassCode: string | null = null;

      if (specialCode.rewardType === "PASS") {
        const randomCode = `LELE-CD-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        const newPass = await tx.queuePass.create({
          data: {
            code: randomCode,
            userId: decoded.user_id,
            rewardTitle: specialCode.rewardTitle,
            status: "ACTIVE",
          },
        });
        createdPassId = newPass.id;
        createdPassCode = newPass.code;

        await tx.pointLog.create({
          data: {
            userId: decoded.user_id,
            amount: 0,
            reason: `ใช้โค้ดพิเศษ (${specialCode.code}): ${specialCode.rewardTitle} (รหัส ${createdPassCode})`,
          },
        });
      } else if (specialCode.rewardType === "POINTS") {
        const pointsToAdd = specialCode.rewardPoints || 0;
        await tx.user.update({
          where: { id: decoded.user_id },
          data: {
            stamps: { increment: pointsToAdd },
          },
        });
        await tx.pointLog.create({
          data: {
            userId: decoded.user_id,
            amount: pointsToAdd,
            reason: `รับแต้มจากโค้ดพิเศษ (${specialCode.code})`,
          },
        });
      }

      // Record redemption to lock 1-per-user
      await tx.codeRedemption.create({
        data: {
          codeId: specialCode.id,
          userId: decoded.user_id,
          passId: createdPassId,
        },
      });

      // Increment usedCount
      await tx.specialCode.update({
        where: { id: specialCode.id },
        data: {
          usedCount: { increment: 1 },
        },
      });

      return {
        createdPassCode,
      };
    });

    const isPass = specialCode.rewardType === "PASS";
    const successMsg = isPass
      ? `ยินดีด้วย! คุณได้รับ "${specialCode.rewardTitle}" เข้ากระเป๋าคูปองเรียบร้อยแล้ว`
      : `ยินดีด้วย! คุณได้รับ "${specialCode.rewardTitle}" (+${specialCode.rewardPoints} แต้ม) เรียบร้อยแล้ว`;

    return NextResponse.json({
      success: true,
      message: successMsg,
      rewardType: specialCode.rewardType,
      rewardTitle: specialCode.rewardTitle,
      rewardPoints: specialCode.rewardPoints,
      passCode: result.createdPassCode,
    });
  } catch (error) {
    console.error("Code redeem error:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการตรวจสอบโค้ด" },
      { status: 500 }
    );
  }
}
