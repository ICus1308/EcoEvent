import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp đầy đủ email và mã xác thực 6 chữ số." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    

    // 1. Find OTP record in database
    const record = await prisma.verificationCode.findFirst({
      where: { email: normalizedEmail, code: cleanCode },
      orderBy: { createdAt: "desc" }
    });

    if (!record) {
      return NextResponse.json(
        { error: "❌ Mã xác thực không chính xác. Vui lòng kiểm tra lại." },
        { status: 400 }
      );
    }

    // 2. Expiration check
    if (new Date() > record.expiresAt) {
      await prisma.verificationCode.delete({ where: { id: record.id } }).catch(() => {});
      return NextResponse.json(
        { error: "⏰ Mã xác thực 6 chữ số đã hết hạn. Vui lòng nhấn gửi lại mã mới." },
        { status: 400 }
      );
    }

    // 3. Mark user as verified
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng." }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true }
    });

    // 4. Create active Session Token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    });

    // Delete all OTPs for this email after successful verification
    await prisma.verificationCode.deleteMany({ where: { email: normalizedEmail } }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Xác thực tài khoản thành công!",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
        isVerified: true
      }
    });
  } catch (error: any) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ khi xác thực mã OTP." },
      { status: 500 }
    );
  }
}
