import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, hashPassword, validatePasswordSecurity } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const adminSession = await getAdminFromRequest(req);
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, name, password, role } = await req.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: "กรุณาระบุ Email และชื่อแสดง" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Basic email format check
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      return NextResponse.json({ error: "รูปแบบอีเมลไม่ถูกต้อง" }, { status: 400 });
    }

    const existing = await prisma.admin.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "อีเมลนี้มีอยู่ในระบบแล้ว" },
        { status: 400 }
      );
    }

    const isCustomPassword = Boolean(password && typeof password === "string" && password.trim().length > 0);
    const plainPassword = isCustomPassword ? password.trim() : "lele@coupon1234";

    if (isCustomPassword) {
      const validation = validatePasswordSecurity(plainPassword);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    const passwordHash = await hashPassword(plainPassword);

    const newAdmin = await prisma.admin.create({
      data: {
        email: cleanEmail,
        name: name.trim(),
        passwordHash,
        role: role || "STAFF",
        mustChangePassword: !isCustomPassword, // If custom password set by owner, ready to use!
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        mustChangePassword: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: isCustomPassword
        ? `เพิ่มแอดมิน ${newAdmin.email} พร้อมรหัสผ่านเรียบร้อยแล้ว`
        : `เพิ่มแอดมิน ${newAdmin.email} สำเร็จ (รหัสผ่านเริ่มต้น: ${plainPassword})`,
      admin: newAdmin,
    });
  } catch (error) {
    console.error("Create admin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
