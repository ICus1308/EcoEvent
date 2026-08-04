import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserPlan } from "@/lib/subscription";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const session = await prisma.session.findUnique({
        where: { token },
        select: { userId: true },
      });
      if (session?.userId) userId = session.userId;
    }

    if (!userId) {
      // Return default free tier overview for guest
      const freePlan = await prisma.plan.findUnique({ where: { tier: "FREE" } });
      return NextResponse.json({
        success: true,
        isGuest: true,
        plan: freePlan,
      });
    }

    const planInfo = await getUserPlan(userId);
    const allPlans = await prisma.plan.findMany({
      orderBy: { monthlyPrice: "asc" },
    });

    return NextResponse.json({
      success: true,
      isGuest: false,
      currentPlan: planInfo.plan,
      subscription: planInfo.subscription,
      isDefaultFree: planInfo.isDefaultFree,
      allPlans,
    });
  } catch (error) {
    console.error("Fetch subscription error:", error);
    return NextResponse.json(
      { success: false, error: "Không thể lấy thông tin gói dịch vụ" },
      { status: 500 }
    );
  }
}
