import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

const productSchema = z.object({
  name: z.string().min(2, "Tên sản phẩm phải từ 2 ký tự trở lên"),
  sku: z.string().optional(),
  code: z.string().optional(),
  description: z.string().optional().default(""),
  category: z.enum(["DECORATION", "EQUIPMENT", "TABLEWARE", "ATTIRE", "PROJECT_TOOLS"]),
  listingType: z.enum(["SALE", "RENT"]),
  price: z.number().min(0, "Giá bán không được âm").optional().nullable(),
  rentalPricePerDay: z.number().min(0, "Giá thuê theo ngày không được âm").optional().nullable(),
  depositAmount: z.number().min(0, "Tiền cọc không được âm").optional().nullable(),
  stock: z.number().int().min(1, "Số lượng trong kho phải ít nhất là 1"),
  imageUrl: z.string().min(1, "Đường dẫn ảnh không được trống"),
  ecoFeatures: z.string().optional().default("🌱 100% Phân hủy")
}).refine((data) => !!(data.sku || data.code), {
  message: "Mã SKU / Code không được để trống",
  path: ["sku"]
});

// GET /api/products - Public Storefront Listing (Only Available Stock, Exclude 0 Stock)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || searchParams.get("q") || "";
    const category = searchParams.get("category");
    const listingType = searchParams.get("listingType");
    const ownerId = searchParams.get("ownerId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Clean up any zero stock items from shop listing automatically (Auto-Deletion Rule)
    await prisma.product.deleteMany({
      where: { stock: { lte: 0 } }
    }).catch(() => {});

    const where: any = {
      status: { not: "INACTIVE" },
      stock: { gt: 0 }
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ];
    }
    if (category && category !== "ALL") where.category = category;
    if (listingType && listingType !== "ALL_TYPES") where.listingType = listingType;
    if (ownerId) where.ownerId = ownerId;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { owner: { select: { id: true, fullname: true, username: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      products,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) }
    });
  } catch (error: any) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ success: false, error: "Lỗi máy chủ khi lấy danh sách sản phẩm" }, { status: 500 });
  }
}

// POST /api/products - User/Vendor publishes new item (Strict Creator Isolation)
export async function POST(req: Request) {
  try {
    const currentUserId = await getAuthenticatedUserId(req);

    if (!currentUserId) {
      return NextResponse.json({ success: false, error: "Vui lòng đăng nhập để đăng sản phẩm" }, { status: 401 });
    }

    // FEATURE GATE: Check subscription limits for product listings
    const { canCreateProduct } = await import("@/lib/subscription");
    const check = await canCreateProduct(currentUserId);

    if (!check.allowed) {
      return NextResponse.json(
        {
          success: false,
          limitReached: true,
          error: `Bạn đã đạt giới hạn tối đa ${check.limit} sản phẩm của ${check.planName}. Vui lòng nâng cấp gói cước để tiếp tục đăng thêm!`,
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      const errorMsg = validation.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }

    const data = validation.data;
    const finalSku = (data.sku || data.code || "").trim().toUpperCase();

    // Check SKU Uniqueness in DB
    const existing = await prisma.product.findUnique({ where: { sku: finalSku } });
    if (existing) {
      return NextResponse.json({ success: false, error: `Mã SKU "${finalSku}" đã tồn tại trên hệ thống.` }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        sku: finalSku,
        name: data.name,
        description: data.description || "",
        category: data.category as any,
        listingType: data.listingType as any,
        price: data.listingType === "SALE" ? data.price : null,
        rentalPricePerDay: data.listingType === "RENT" ? data.rentalPricePerDay : null,
        depositAmount: data.listingType === "RENT" ? data.depositAmount : null,
        stock: data.stock,
        imageUrl: data.imageUrl,
        ecoFeatures: data.ecoFeatures || "🌱 100% Phân hủy",
        ownerId: currentUserId
      }
    });

    // Auto-assign to default warehouse so it displays properly in multi-warehouse architecture
    const defaultWarehouse = await prisma.warehouse.findFirst();
    if (defaultWarehouse) {
      await prisma.warehouseInventory.create({
        data: {
          productId: product.id,
          warehouseId: defaultWarehouse.id,
          quantity: data.stock,
          reservedQty: 0
        }
      });
    }

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ success: false, error: error.message || "Lỗi máy chủ khi đăng sản phẩm" }, { status: 500 });
  }
}
