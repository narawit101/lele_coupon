import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDefaultAdmin, verifyPassword, createAdminToken } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    await ensureDefaultAdmin();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "กรุณาระบุ Email และ Password" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const admin = await prisma.admin.findUnique({
      where: { email: cleanEmail },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "ไม่พบอีเมลผู้ใช้งานนี้ในระบบ" },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "รหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    const sessionPayload = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      mustChangePassword: admin.mustChangePassword,
      avatarUrl: admin.avatarUrl || null,
    };

    const token = createAdminToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      token,
      admin: sessionPayload,
      mustChangePassword: admin.mustChangePassword,
    });

    response.cookies.set("lele_admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
