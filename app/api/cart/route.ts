import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/cart - Pure Database Cart Query for Authenticated User Only (Private Cart)
export async function GET(req: Request) {
  try {
    const currentUserId = await getAuthenticatedUserId(req);

    if (!currentUserId) {
      return NextResponse.json({ success: true, items: [] });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: currentUserId },
      include: {
        items: {
          include: { product: true, warehouse: true }
        }
      }
    });

    // Clean up any cart items where product has stock <= 0
    const validItems = (cart?.items || []).filter(item => item.product && item.product.stock > 0);

    return NextResponse.json({
      success: true,
      items: validItems
    });
  } catch (error: any) {
    console.error("GET /api/cart error:", error);
    return NextResponse.json({ success: false, error: "Lỗi máy chủ khi lấy giỏ hàng" }, { status: 500 });
  }
}

// POST /api/cart - Add item to user private cart with Out-of-Stock Auto-Deletion & Owner Isolation Guards
export async function POST(req: Request) {
  try {
    const currentUserId = await getAuthenticatedUserId(req);

    if (!currentUserId) {
      return NextResponse.json({ success: false, error: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { productId, warehouseId: inputWarehouseId, quantity = 1, startDate, endDate } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: "Thiếu thông tin sản phẩm (productId)" }, { status: 400 });
    }

    // 1. Fetch Product & Inventories
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { inventories: { include: { warehouse: true } } }
    });

    if (!product) {
      return NextResponse.json({ success: false, error: "Sản phẩm không tồn tại hoặc đã bị gỡ bỏ" }, { status: 404 });
    }

    // GUARD 1: Private User Inventory (Self-Purchase Block)
    if (product.ownerId === currentUserId) {
      return NextResponse.json(
        { success: false, error: "🚫 Bạn không thể thêm sản phẩm thuộc kho hàng cá nhân của mình vào giỏ hàng!" },
        { status: 403 }
      );
    }

    // Determine Warehouse Target
    let targetInventory = product.inventories.find(inv => inv.warehouseId === inputWarehouseId);
    if (!targetInventory && product.inventories.length > 0) {
      targetInventory = product.inventories[0];
    }

    const availableStock = targetInventory 
      ? Math.max(0, targetInventory.quantity - targetInventory.reservedQty)
      : product.stock;

    // GUARD 2 & Auto-Deletion: Stock Check
    if (product.status === "OUT_OF_STOCK" || availableStock <= 0 || product.stock <= 0) {
      // Auto-delete out of stock product from database and carts (Cascade Deletion)
      await prisma.product.delete({ where: { id: product.id } }).catch(() => {});

      return NextResponse.json(
        { success: false, error: "⚠️ Sản phẩm này đã hết hàng (stock = 0) và đã tự động được gỡ khỏi cửa hàng!" },
        { status: 400 }
      );
    }

    if (quantity > availableStock) {
      return NextResponse.json(
        { success: false, error: `⚠️ Số lượng yêu cầu (${quantity}) vượt quá tồn kho khả dụng (${availableStock})` },
        { status: 400 }
      );
    }

    // Ensure Private User Cart Exists
    let cart = await prisma.cart.findUnique({ where: { userId: currentUserId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: currentUserId } });
    }

    const selectedWarehouseId = targetInventory?.warehouseId || inputWarehouseId || null;

    // Check if item already exists in private cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: product.id,
        warehouseId: selectedWarehouseId
      }
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
          warehouseId: selectedWarehouseId,
          quantity,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null
        }
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true, warehouse: true } } }
    });

    return NextResponse.json({ success: true, items: updatedCart?.items || [] });
  } catch (error: any) {
    console.error("POST /api/cart error:", error);
    return NextResponse.json({ success: false, error: "Lỗi máy chủ khi thêm vào giỏ hàng" }, { status: 500 });
  }
}

// DELETE /api/cart - Delete cart item from private user cart
export async function DELETE(req: Request) {
  try {
    const currentUserId = await getAuthenticatedUserId(req);

    if (!currentUserId) {
      return NextResponse.json({ success: false, error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (itemId) {
      const cartItem = await prisma.cartItem.findUnique({
        where: { id: itemId },
        include: { cart: true }
      });

      // Strict User Cart Isolation Guard
      if (cartItem && cartItem.cart.userId === currentUserId) {
        await prisma.cartItem.delete({ where: { id: itemId } });
      } else if (cartItem) {
        return NextResponse.json({ success: false, error: "🚫 Bạn không có quyền xóa sản phẩm trong giỏ hàng của người khác" }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, message: "Đã cập nhật giỏ hàng" });
  } catch (error: any) {
    console.error("DELETE /api/cart error:", error);
    return NextResponse.json({ success: false, error: "Lỗi máy chủ khi xóa sản phẩm khỏi giỏ hàng" }, { status: 500 });
  }
}
