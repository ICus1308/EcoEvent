import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getPrisma() {
  try {
    
    return prisma;
  } catch {
    return null;
  }
}

// GET /api/orders - Pure DB query for user's order & rental history
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'buy', 'renting', 'rented', 'all'
    const authHeader = req.headers.get("Authorization");
    let currentUserId: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7);
        const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
        if (decoded?.userId) currentUserId = decoded.userId;
      } catch (e) {}
    }

    const prisma = await getPrisma();
    if (!prisma) {
      return NextResponse.json({ success: false, error: "Không thể kết nối cơ sở dữ liệu" }, { status: 500 });
    }

    if (!currentUserId) {
      const demoUser = await prisma.user.findFirst();
      currentUserId = demoUser ? demoUser.id : "user-demo-1";
    }

    const orders = await prisma.bookingOrder.findMany({
      where: { buyerId: currentUserId },
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Transform DB order list into response format with type tags
    let formatted = orders.map((o) => {
      const mainItem = o.items[0]?.product;
      const isRent = o.rentalStartDate || (mainItem && mainItem.listingType === "RENT");
      const isCompleted = o.status === "COMPLETED" || o.status === "DELIVERED";

      let computedType = "buy";
      if (isRent) {
        computedType = isCompleted ? "rented" : "renting";
      }

      return {
        id: o.id,
        type: computedType,
        buyerId: o.buyerId,
        productName: mainItem?.name || "Sản phẩm Eco-Gear",
        sku: mainItem?.sku || "ECO-SKU",
        imageUrl: mainItem?.imageUrl || "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600",
        rentalStartDate: o.rentalStartDate ? o.rentalStartDate.toISOString().split("T")[0] : null,
        rentalEndDate: o.rentalEndDate ? o.rentalEndDate.toISOString().split("T")[0] : null,
        totalAmount: o.totalAmount,
        depositTotal: o.depositTotal,
        status: o.status,
        createdAt: o.createdAt.toISOString().split("T")[0]
      };
    });

    if (type && type !== "all") {
      formatted = formatted.filter((o) => o.type === type);
    }

    return NextResponse.json({
      success: true,
      orders: formatted
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Lỗi máy chủ khi lấy danh sách đơn hàng" }, { status: 500 });
  }
}
