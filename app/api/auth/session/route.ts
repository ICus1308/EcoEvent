import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Phiên làm việc không hợp lệ." },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Decode Dynamic Session Token
    if (token.startsWith("demo-token-")) {
      try {
        const encoded = token.replace("demo-token-", "");
        const userData = JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8"));
        return NextResponse.json({
          success: true,
          user: userData,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
      } catch (e) {
        console.warn("Failed to decode demo session token:", e);
      }
    }

    try {
      

      const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true }
      });

      if (session) {
        if (new Date() > session.expiresAt) {
          await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
          return NextResponse.json(
            { error: "Phiên làm việc đã hết hạn sau 24 giờ không hoạt động." },
            { status: 401 }
          );
        }

        const refreshedExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await prisma.session.update({
          where: { id: session.id },
          data: { expiresAt: refreshedExpiresAt }
        }).catch(() => {});

        return NextResponse.json({
          success: true,
          user: {
            id: session.user.id,
            username: session.user.username,
            email: session.user.email,
            fullname: session.user.fullname,
            role: session.user.role
          },
          expiresAt: refreshedExpiresAt.toISOString()
        });
      }
    } catch (dbError) {
      console.warn("DB connection error in session verification, falling back:", dbError);
    }

    // Generic fallback if token could not be parsed or found
    return NextResponse.json(
      { error: "Phiên làm việc đã hết hạn." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Session verification error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi xác thực phiên làm việc." },
      { status: 500 }
    );
  }
}
