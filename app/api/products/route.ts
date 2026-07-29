import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

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

async function getAuthenticatedUserId(req: Request): Promise<string | null> {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

    const token = authHeader.substring(7);

    // 1. Check demo-token prefix
    if (token.startsWith("demo-token-")) {
      try {
        const raw = token.replace("demo-token-", "");
        const decodedStr = Buffer.from(raw.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
        const decoded = JSON.parse(decodedStr);
        if (decoded?.id || decoded?.userId) {
          return decoded.id || decoded.userId;
        }
      } catch (e) {}
    }

    // 2. Check JSON encoded token format
    try {
      const decodedStr = Buffer.from(token.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
      const decoded = JSON.parse(decodedStr);
      if (decoded?.id || decoded?.userId) {
        return decoded.id || decoded.userId;
      }
    } catch (e) {}

    // 3. Check Prisma session database table
    try {
      const session = await prisma.session.findUnique({
        where: { token },
        select: { userId: true }
      });
      if (session?.userId) return session.userId;
    } catch (e) {}

    return null;
  } catch (e) {
    return null;
  }
}

// GET /api/products - Public Storefront Listing (Strict Database-Only Query)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || searchParams.get("q") || "";
    const category = searchParams.get("category");
    const listingType = searchParams.get("listingType");
    const ownerId = searchParams.get("ownerId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {
      status: { not: "INACTIVE" }
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

// POST /api/products - User/Vendor publishes new item directly to DB
export async function POST(req: Request) {
  try {
    let currentUserId = await getAuthenticatedUserId(req);

    // Ensure valid ownerId exists in database
    if (currentUserId) {
      const userExists = await prisma.user.findUnique({ where: { id: currentUserId } });
      if (!userExists) {
        currentUserId = null;
      }
    }

    // Fallback: If unauthenticated or user deleted, use/create a default system vendor
    if (!currentUserId) {
      let defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        defaultUser = await prisma.user.create({
          data: {
            username: "ecovendor",
            email: "vendor@eco.vn",
            fullname: "Chủ Cửa Hàng Sinh Thái",
            passwordHash: "default_hash",
            role: "VENDOR",
            isVerified: true
          }
        });
      }
      currentUserId = defaultUser.id;
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

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ success: false, error: error.message || "Lỗi máy chủ khi đăng sản phẩm" }, { status: 500 });
  }
}
