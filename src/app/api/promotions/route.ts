import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/promotions — List active promotions for customers
export async function GET() {
  try {
    const promotions = await prisma.promotion.findMany({
      where: { isActive: true },
      orderBy: { points: "asc" },
    });
    return NextResponse.json({ promotions });
  } catch (error) {
    console.error("Fetch promotions error:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการโหลดโปรโมชั่น" },
      { status: 500 }
    );
  }
}
