import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

const AUTH_SECRET = process.env.ADMIN_SECRET || "lele_secret_key_2026";

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: string;
  mustChangePassword: boolean;
  avatarUrl?: string | null;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Validate password requirements:
 * - Minimum 8 characters
 * - Must include at least 1 letter and 1 number
 * - Cannot be default "1234"
 */
export function validatePasswordSecurity(password: string): { valid: boolean; error?: string } {
  if (password === "lele@coupon1234") {
    return { valid: false, error: "ไม่สามารถใช้รหัสผ่านเริ่มต้น 'lele@coupon1234' ได้" };
  }
  if (password.length < 8) {
    return { valid: false, error: "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร" };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasLetter || !hasNumber) {
    return { valid: false, error: "รหัสผ่านต้องประกอบด้วยตัวอักษรภาษาอังกฤษและตัวเลข" };
  }
  return { valid: true };
}

// ponytail: Native HMAC token generation - zero extra dependencies, tamper-proof
export function createAdminToken(admin: AdminSession): string {
  const payload = Buffer.from(
    JSON.stringify({
      ...admin,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    })
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export function verifyAdminToken(tokenString: string | null): AdminSession | null {
  if (!tokenString) return null;
  const parts = tokenString.split(".");
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payload)
    .digest("base64url");

  if (signature !== expectedSig) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (data.exp && Date.now() > data.exp) return null;
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role || "STAFF",
      mustChangePassword: Boolean(data.mustChangePassword),
      avatarUrl: data.avatarUrl || null,
    };
  } catch {
    return null;
  }
}

export async function getAdminFromRequest(req: NextRequest): Promise<AdminSession | null> {
  const token = req.headers.get("x-admin-token") || req.cookies.get("lele_admin_token")?.value || null;
  return verifyAdminToken(token);
}


export async function ensureDefaultAdmin() {
  const count = await prisma.admin.count();
  if (count === 0) {
    const defaultEmail = process.env.DEV_DEFAULT_EMAIL || "dev@system.lele.com";
    const defaultPass = process.env.DEV_DEFAULT_PASS || "1234";
    const defaultName = process.env.DEV_DEFAULT_NAME || "System Developer";

    const passwordHash = await hashPassword(defaultPass);
    await prisma.admin.create({
      data: {
        email: defaultEmail.toLowerCase().trim(),
        name: defaultName,
        passwordHash,
        role: "DEV",
        mustChangePassword: true, // Force change on first login!
      },
    });
    console.log(`[Admin Seed] Created initial Dev admin: ${defaultEmail} (Password: 1234, mustChangePassword: true)`);
  }
}
