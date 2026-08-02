import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/inventory - Strict Private Inventory Query for Authenticated User Only
export async function GET(req: Request) {
  try {
    const currentUserId = await getAuthenticatedUserId(req);

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: "Vui lòng đăng nhập để xem kho hàng cá nhân" },
        { status: 401 }
      );
    }

    const inventory = await prisma.product.findMany({
      where: { ownerId: currentUserId },
      include: {
        inventories: { include: { warehouse: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, inventory });
  } catch (error: any) {
    console.error("GET /api/inventory error:", error);
    return NextResponse.json({ success: false, error: "Lỗi máy chủ khi lấy kho hàng cá nhân" }, { status: 500 });
  }
}
