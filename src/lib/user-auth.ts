import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "lele_ticket_jwt_secret_2026";

export interface UserTokenPayload {
  user_id: string;
  line_id?: string;
}

/**
 * สร้าง JWT Token สำหรับ User Session (อายุ 7 วัน)
 */
export function createUserToken(userId: string, lineId: string): string {
  return jwt.sign(
    {
      user_id: userId,
      line_id: lineId,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/**
 * ดึง User ID จาก Authorization Bearer Header ของ NextRequest
 * คืนค่า userId หาก Token ถูกต้อง หรือ null หากไม่พบ/หมดอายุ/ไม่ถูกต้อง
 */
export function getUserIdFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserTokenPayload;
    return decoded.user_id || null;
  } catch {
    return null;
  }
}

