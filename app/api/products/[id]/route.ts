import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUserId } from "@/lib/auth";

const patchProductSchema = z.object({
  name: z.string().min(2, "Tên sản phẩm phải có từ 2 ký tự").optional(),
  sku: z.string().min(2, "Mã SKU không được trống").optional(),
  description: z.string().optional(),
  category: z.enum(["DECORATION", "EQUIPMENT", "TABLEWARE", "ATTIRE", "PROJECT_TOOLS"]).optional(),
  status: z.enum(["IN_STOCK", "OUT_OF_STOCK", "ON_SALE", "BEST_SELLER", "NEW_ARRIVAL", "FREE_BORROW", "INACTIVE"]).optional(),
  listingType: z.enum(["SALE", "RENT"]).optional(),
  price: z.number().min(0, "Giá không được âm").optional().nullable(),
  rentalPricePerDay: z.number().min(0, "Giá thuê không được âm").optional().nullable(),
  depositAmount: z.number().min(0, "Tiền cọc không được âm").optional().nullable(),
  stock: z.number().int().min(0, "Số lượng không được âm").optional(),
  imageUrl: z.string().min(1, "Ảnh không được trống").optional(),
  ecoFeatures: z.string().optional()
});

// GET /api/products/[id] - Pure DB Query
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { sku: id }]
      },
      include: {
        owner: { select: { id: true, fullname: true, username: true, role: true } },
        inventories: { include: { warehouse: true } }
      }
    });

    if (!product) {
      return NextResponse.json({ success: false, error: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Lỗi máy chủ khi lấy chi tiết sản phẩm" }, { status: 500 });
  }
}

// PATCH /api/products/[id] - Secure update with strict ownership check & auto-deletion on 0 stock
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const currentUserId = await getAuthenticatedUserId(req);

    if (!currentUserId) {
      return NextResponse.json({ success: false, error: "Vui lòng đăng nhập để thực hiện" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    // Zod validation
    const validation = patchProductSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }

    const updateData = validation.data;

    const existing = await prisma.product.findFirst({
      where: { OR: [{ id }, { sku: id }] }
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Sản phẩm không tồn tại" }, { status: 404 });
    }

    // Strict Server-side Creator Ownership Guard
    if (existing.ownerId !== currentUserId) {
      return NextResponse.json({ success: false, error: "🚫 Bạn không có quyền chỉnh sửa sản phẩm của người khác!" }, { status: 403 });
    }

    // Auto-Deletion Rule: If stock drops to 0, automatically delete product from shop listing and carts
    if (updateData.stock !== undefined && updateData.stock <= 0) {
      await prisma.product.delete({ where: { id: existing.id } });
      return NextResponse.json({
        success: true,
        message: "Sản phẩm đã hết hàng (số lượng = 0) và tự động bị gỡ khỏi cửa hàng.",
        deleted: true
      });
    }

    const updated = await prisma.product.update({
      where: { id: existing.id },
      data: updateData as any
    });

    // Sync the updated stock to the warehouse inventory record
    if (updateData.stock !== undefined) {
      await prisma.warehouseInventory.updateMany({
        where: { productId: existing.id },
        data: { quantity: updateData.stock }
      });
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Lỗi máy chủ khi cập nhật sản phẩm" }, { status: 500 });
  }
}

// PUT /api/products/[id] - Compatible alias for PATCH
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  return PATCH(req, props);
}

// DELETE /api/products/[id] - Secure delete with strict creator ownership guard
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const currentUserId = await getAuthenticatedUserId(req);

    if (!currentUserId) {
      return NextResponse.json({ success: false, error: "Vui lòng đăng nhập để thực hiện" }, { status: 401 });
    }

    const existing = await prisma.product.findFirst({
      where: { OR: [{ id }, { sku: id }] }
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Sản phẩm không tồn tại" }, { status: 404 });
    }

    // Strict Server-side Creator Ownership Guard
    if (existing.ownerId !== currentUserId) {
      return NextResponse.json({ success: false, error: "🚫 Bạn không có quyền xóa sản phẩm của người khác!" }, { status: 403 });
    }

    await prisma.product.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true, message: "Đã xóa sản phẩm thành công" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Lỗi máy chủ khi xóa sản phẩm" }, { status: 500 });
  }
}
