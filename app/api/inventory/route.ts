import { NextResponse } from "next/server";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(2, "Tên sản phẩm phải từ 2 ký tự trở lên"),
  sku: z.string().min(2, "Mã SKU không được để trống"),
  description: z.string().optional().default(""),
  category: z.enum(["DECORATION", "EQUIPMENT", "TABLEWARE", "ATTIRE", "PROJECT_TOOLS"]),
  listingType: z.enum(["SALE", "RENT"]),
  price: z.number().min(0, "Giá bán không được âm").optional().nullable(),
  rentalPricePerDay: z.number().min(0, "Giá thuê theo ngày không được âm").optional().nullable(),
  depositAmount: z.number().min(0, "Tiền cọc không được âm").optional().nullable(),
  stock: z.number().int().min(1, "Số lượng phải từ 1 trở lên"),
  imageUrl: z.string().min(1, "Đường dẫn ảnh không được trống"),
  ecoFeatures: z.string().optional().default("🌱 Thân thiện môi trường")
});

async function getPrisma() {
  try {
    const { prisma } = await import("@/lib/prisma");
    return prisma;
  } catch {
    return null;
  }
}

// GET /api/inventory - Pure DB fetch for current vendor's items
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

    const inventory = await prisma.product.findMany({
      where: { ownerId: currentUserId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, inventory });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Lỗi máy chủ khi lấy kho hàng" }, { status: 500 });
  }
}

// POST /api/inventory - Create product directly in DB
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
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      const errorMsg = validation.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }

    const data = validation.data;

    const existing = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existing) {
      return NextResponse.json({ success: false, error: `Mã SKU "${data.sku}" đã tồn tại.` }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        description: data.description || "",
        category: data.category as any,
        listingType: data.listingType as any,
        price: data.listingType === "SALE" ? data.price : null,
        rentalPricePerDay: data.listingType === "RENT" ? data.rentalPricePerDay : null,
        depositAmount: data.listingType === "RENT" ? data.depositAmount : null,
        stock: data.stock,
        imageUrl: data.imageUrl,
        ecoFeatures: data.ecoFeatures || "🌱 Thân thiện môi trường",
        ownerId: currentUserId
      }
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Lỗi máy chủ khi tạo niêm yết" }, { status: 500 });
  }
}
