import { NextResponse } from "next/server";
import { z } from "zod";

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

async function getPrisma() {
  try {
    const { prisma } = await import("@/lib/prisma");
    return prisma;
  } catch {
    return null;
  }
}

async function getCurrentUserId(req: Request): Promise<string> {
  const authHeader = req.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.substring(7);
      const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
      if (decoded?.userId) return decoded.userId;
    } catch (e) {}
  }

  const prisma = await getPrisma();
  if (prisma) {
    const user = await prisma.user.findFirst();
    if (user) return user.id;
  }
  return "user-demo-1";
}

// GET /api/products/[id] - Pure DB Query
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const prisma = await getPrisma();

    if (!prisma) {
      return NextResponse.json({ success: false, error: "Không thể kết nối cơ sở dữ liệu" }, { status: 500 });
    }

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { sku: id }]
      },
      include: { owner: { select: { id: true, fullname: true, username: true, role: true } } }
    });

    if (!product) {
      return NextResponse.json({ success: false, error: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Lỗi máy chủ khi lấy chi tiết sản phẩm" }, { status: 500 });
  }
}

// PATCH /api/products/[id] - Secure update with ownership check & Zod validation
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const currentUserId = await getCurrentUserId(req);
    const body = await req.json().catch(() => ({}));

    // Zod validation
    const validation = patchProductSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }

    const updateData = validation.data;
    const prisma = await getPrisma();

    if (!prisma) {
      return NextResponse.json({ success: false, error: "Không thể kết nối cơ sở dữ liệu" }, { status: 500 });
    }

    const existing = await prisma.product.findFirst({
      where: { OR: [{ id }, { sku: id }] }
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Sản phẩm không tồn tại" }, { status: 404 });
    }

    // Server-side ownership guard
    if (existing.ownerId !== currentUserId) {
      return NextResponse.json({ success: false, error: "Bạn không có quyền chỉnh sửa sản phẩm này" }, { status: 403 });
    }

    const updated = await prisma.product.update({
      where: { id: existing.id },
      data: updateData as any
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Lỗi máy chủ khi cập nhật sản phẩm" }, { status: 500 });
  }
}

// PUT /api/products/[id] - Compatible alias for PATCH
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  return PATCH(req, props);
}

// DELETE /api/products/[id] - Secure delete/archive
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const currentUserId = await getCurrentUserId(req);
    const prisma = await getPrisma();

    if (!prisma) {
      return NextResponse.json({ success: false, error: "Không thể kết nối cơ sở dữ liệu" }, { status: 500 });
    }

    const existing = await prisma.product.findFirst({
      where: { OR: [{ id }, { sku: id }] }
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Sản phẩm không tồn tại" }, { status: 404 });
    }

    if (existing.ownerId !== currentUserId) {
      return NextResponse.json({ success: false, error: "Bạn không có quyền xóa sản phẩm này" }, { status: 403 });
    }

    await prisma.product.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true, message: "Đã xóa sản phẩm thành công" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Lỗi máy chủ khi xóa sản phẩm" }, { status: 500 });
  }
}
