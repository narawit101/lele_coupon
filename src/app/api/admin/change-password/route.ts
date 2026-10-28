import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAdminFromRequest,
  verifyPassword,
  hashPassword,
  validatePasswordSecurity,
  createAdminToken,
} from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const adminSession = await getAdminFromRequest(req);
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { oldPassword, newPassword } = await req.json();

    if (!newPassword) {
      return NextResponse.json(
        { error: "กรุณาระบุรหัสผ่านใหม่" },
        { status: 400 }
      );
    }

    // Validate security rules
    const validation = validatePasswordSecurity(newPassword);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminSession.id },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // If oldPassword was supplied, verify it
    if (oldPassword) {
      const isMatch = await verifyPassword(oldPassword, admin.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: "รหัสผ่านเดิมไม่ถูกต้อง" }, { status: 400 });
      }
    }

    const newHash = await hashPassword(newPassword);
    const updatedAdmin = await prisma.admin.update({
      where: { id: admin.id },
      data: {
        passwordHash: newHash,
        mustChangePassword: false, // Cleared!
      },
    });

    const newSessionPayload = {
      id: updatedAdmin.id,
      email: updatedAdmin.email,
      name: updatedAdmin.name,
      role: updatedAdmin.role,
      mustChangePassword: false,
    };

    const newToken = createAdminToken(newSessionPayload);

    const response = NextResponse.json({
      success: true,
      message: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว",
      token: newToken,
      admin: newSessionPayload,
    });

    response.cookies.set("lele_admin_token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
