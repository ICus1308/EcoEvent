import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    let token = "";
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else {
      const body = await req.json().catch(() => ({}));
      token = body.token || "";
    }

    if (token && !token.startsWith("demo-session-token")) {
      try {
        await prisma.session.deleteMany({
          where: { token }
        });
      } catch (dbError) {
        console.warn("DB error during logout session deletion:", dbError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Đăng xuất thành công!"
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra trong quá trình đăng xuất." },
      { status: 500 }
    );
  }
}
