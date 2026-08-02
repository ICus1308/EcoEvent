import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendOtpEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp địa chỉ email để gửi lại mã OTP." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy tài khoản với email này." }, { status: 404 });
    }

    // Generate new 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationCode.deleteMany({ where: { email: normalizedEmail } }).catch(() => {});
    await prisma.verificationCode.create({
      data: {
        email: normalizedEmail,
        code: otpCode,
        expiresAt
      }
    });

    // Trigger Real SMTP Email Sending (with Console Fallback)
    await sendOtpEmail(normalizedEmail, otpCode);

    return NextResponse.json({
      success: true,
      message: "Đã gửi lại mã xác thực 6 chữ số mới tới email của bạn!",
      otpDebug: process.env.NODE_ENV !== "production" ? otpCode : undefined
    });
  } catch (error: any) {
    console.error("Resend OTP Error:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ khi gửi lại mã OTP." },
      { status: 500 }
    );
  }
}
