import { NextResponse } from "next/server";

async function getPrisma() {
  try {
    const { prisma } = await import("@/lib/prisma");
    return prisma;
  } catch {
    return null;
  }
}

// GET /api/cart - Pure Database Cart Query
export async function GET(req: Request) {
  try {
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

    const cart = await prisma.cart.findUnique({
      where: { userId: currentUserId },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      items: cart?.items || []
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Lỗi máy chủ khi lấy giỏ hàng" }, { status: 500 });
  }
}

// POST /api/cart - Add item to database cart with Fault Tolerance Guards
export async function POST(req: Request) {
  try {
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

    const body = await req.json().catch(() => ({}));
    const { productId, quantity = 1, startDate, endDate } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: "Thiếu thông tin sản phẩm (productId)" }, { status: 400 });
    }

    // 1. Fetch Product
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ success: false, error: "Sản phẩm không tồn tại" }, { status: 404 });
    }

    // GUARD 1: Self-Purchase Block
    if (product.ownerId === currentUserId) {
      return NextResponse.json(
        { success: false, error: "🚫 Bạn không thể thêm sản phẩm của chính mình vào giỏ hàng!" },
        { status: 403 }
      );
    }

    // GUARD 2: Stock & Status Check
    if (product.status === "OUT_OF_STOCK" || product.stock <= 0) {
      return NextResponse.json(
        { success: false, error: "⚠️ Sản phẩm này hiện đã hết hàng!" },
        { status: 400 }
      );
    }

    if (quantity > product.stock) {
      return NextResponse.json(
        { success: false, error: `⚠️ Số lượng yêu cầu (${quantity}) vượt quá tồn kho (${product.stock})` },
        { status: 400 }
      );
    }

    // Ensure User Cart Exists
    let cart = await prisma.cart.findUnique({ where: { userId: currentUserId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: currentUserId } });
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: product.id }
    });

    if (existingCartItem) {
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity,
          startDate: startDate ? new Date(startDate) : existingCartItem.startDate,
          endDate: endDate ? new Date(endDate) : existingCartItem.endDate
        }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null
        }
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true } } }
    });

    return NextResponse.json({ success: true, items: updatedCart?.items || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Lỗi máy chủ khi thêm vào giỏ hàng" }, { status: 500 });
  }
}

// DELETE /api/cart - Delete cart item from DB
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    const prisma = await getPrisma();
    if (!prisma) {
      return NextResponse.json({ success: false, error: "Không thể kết nối cơ sở dữ liệu" }, { status: 500 });
    }

    if (itemId) {
      await prisma.cartItem.delete({ where: { id: itemId } }).catch(() => {});
    }

    return NextResponse.json({ success: true, message: "Đã cập nhật giỏ hàng" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Lỗi máy chủ khi xóa sản phẩm khỏi giỏ hàng" }, { status: 500 });
  }
}
