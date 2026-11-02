import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, createAdminToken } from "@/lib/admin-auth";
import { deleteFromCloudinary } from "@/lib/cloudinary";

// PATCH /api/admin/profile — Update admin name and/or avatarUrl
export async function PATCH(req: NextRequest) {
  try {
    const adminSession = await getAdminFromRequest(req);
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, avatarUrl } = await req.json();

    let normalizedEmail: string | undefined;
    if (email !== undefined && email.trim().toLowerCase() !== adminSession.email.toLowerCase()) {
      if (adminSession.role !== "DEV") {
        return NextResponse.json(
          { error: "เฉพาะ Developer เท่านั้นที่สามารถแก้ไขอีเมลได้" },
          { status: 403 }
        );
      }
      const targetEmail = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
        return NextResponse.json(
          { error: "รูปแบบอีเมลไม่ถูกต้อง" },
          { status: 400 }
        );
      }
      normalizedEmail = targetEmail;
      const existing = await prisma.admin.findUnique({
        where: { email: targetEmail },
      });
      if (existing && existing.id !== adminSession.id) {
        return NextResponse.json(
          { error: "อีเมลนี้มีอยู่ในระบบแล้ว กรุณาใช้อีเมลอื่น" },
          { status: 400 }
        );
      }
    }

    // If updating avatarUrl, delete the previous image from Cloudinary to save storage
    if (avatarUrl !== undefined) {
      const existingAdmin = await prisma.admin.findUnique({
        where: { id: adminSession.id },
        select: { avatarUrl: true },
      });
      if (
        existingAdmin?.avatarUrl &&
        existingAdmin.avatarUrl !== avatarUrl &&
        existingAdmin.avatarUrl.includes("res.cloudinary.com")
      ) {
        deleteFromCloudinary(existingAdmin.avatarUrl).catch((err) =>
          console.error("Failed to delete old admin avatar:", err)
        );
      }
    }

    const updated = await prisma.admin.update({
      where: { id: adminSession.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(normalizedEmail && { email: normalizedEmail }),
        ...(avatarUrl !== undefined && { avatarUrl: avatarUrl ? avatarUrl.trim() : null }),
      },
    });

    const newSession = {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      mustChangePassword: updated.mustChangePassword,
      avatarUrl: updated.avatarUrl || null,
    };

    const token = createAdminToken(newSession);

    const response = NextResponse.json({
      success: true,
      admin: newSession,
      token,
    });

    response.cookies.set("lele_admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Update admin profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
