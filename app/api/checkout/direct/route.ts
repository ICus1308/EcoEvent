import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getPrisma() {
  try {
    
    return prisma;
  } catch {
    return null;
  }
}

// POST /api/checkout/direct - Immediate Buy Now / Rent Now with Full Fault Tolerance
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    let currentUserId: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const prisma = await getPrisma();
      if (prisma) {
        const session = await prisma.session.findUnique({
          where: { token },
          select: { userId: true }
        });
        if (session?.userId) currentUserId = session.userId;
      }
    }

    if (!currentUserId) {
      return NextResponse.json({ success: false, error: "Vui lòng đăng nhập để thực hiện chức năng này" }, { status: 401 });
    }

    const prisma = await getPrisma();
    if (!prisma) {
      return NextResponse.json({ success: false, error: "Không thể kết nối cơ sở dữ liệu" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const { productId, quantity = 1, rentalStartDate, rentalEndDate } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: "Thiếu thông tin sản phẩm (productId)" }, { status: 400 });
    }

    // 1. Fetch Product directly from DB
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: productId }, { sku: productId }]
      }
    });

    if (!product) {
      return NextResponse.json({ success: false, error: "Sản phẩm không tồn tại trên hệ thống" }, { status: 404 });
    }

    // FAULT TOLERANCE GUARD 1: Self-Purchase / Self-Rent Block
    if (product.ownerId === currentUserId) {
      return NextResponse.json(
        { success: false, error: "🚫 Bạn không thể tự mua hoặc thuê sản phẩm do chính bạn đăng bán!" },
        { status: 403 }
      );
    }

    // FAULT TOLERANCE GUARD 2: Stock & Status Check
    if (product.status === "OUT_OF_STOCK" || product.stock <= 0) {
      return NextResponse.json(
        { success: false, error: "⚠️ Sản phẩm này hiện đã hết hàng trong kho!" },
        { status: 400 }
      );
    }

    if (quantity > product.stock) {
      return NextResponse.json(
        { success: false, error: `⚠️ Số lượng yêu cầu (${quantity}) vượt quá tồn kho khả dụng (${product.stock})` },
        { status: 400 }
      );
    }

    // FAULT TOLERANCE GUARD 3: Status check
    if (product.status === "INACTIVE") {
      return NextResponse.json(
        { success: false, error: "Sản phẩm đã bị tạm ẩn hoặc ngừng kinh doanh." },
        { status: 400 }
      );
    }

    const isRent = product.listingType === "RENT" || !!rentalStartDate;

    let rentalDays = 1;
    if (isRent && rentalStartDate && rentalEndDate) {
      const start = new Date(rentalStartDate);
      const end = new Date(rentalEndDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      rentalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    const totalAmount = isRent
      ? (product.rentalPricePerDay || 0) * rentalDays * quantity
      : (product.price || 0) * quantity;

    const depositTotal = isRent ? (product.depositAmount || 0) * quantity : 0;

    // Execute Transaction: Create Order & Update Product Stock in DB
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.bookingOrder.create({
        data: {
          buyerId: currentUserId!,
          totalAmount,
          depositTotal,
          status: isRent ? "RENTAL_ACTIVE" : "PAID",
          rentalStartDate: isRent && rentalStartDate ? new Date(rentalStartDate) : null,
          rentalEndDate: isRent && rentalEndDate ? new Date(rentalEndDate) : null,
          items: {
            create: [
              {
                productId: product.id,
                quantity,
                price: isRent ? (product.rentalPricePerDay || 0) : (product.price || 0)
              }
            ]
          }
        },
        include: { items: { include: { product: true } } }
      });

      // Deduct stock
      const newStock = Math.max(0, product.stock - quantity);
      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: newStock,
          status: newStock === 0 ? "OUT_OF_STOCK" : product.status
        }
      });

      return createdOrder;
    });

    return NextResponse.json(
      {
        success: true,
        message: isRent ? "Đặt thuê thành công!" : "Thanh toán thành công!",
        orderId: order.id,
        order
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Direct Checkout Error:", error);
    return NextResponse.json({ success: false, error: "Lỗi máy chủ khi thực hiện thanh toán" }, { status: 500 });
  }
}
