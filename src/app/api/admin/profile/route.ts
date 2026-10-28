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

    const { name, avatarUrl } = await req.json();

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
