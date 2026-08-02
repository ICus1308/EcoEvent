import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
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

    // 1. Find existing pending registration
    const pendingRecord = await prisma.pendingRegistration.findUnique({
      where: { email: normalizedEmail }
    });

    if (!pendingRecord) {
      return NextResponse.json(
        { error: "Phiên đăng ký đã hết hạn hoặc không tồn tại. Vui lòng quay lại trang Đăng ký." },
        { status: 400 }
      );
    }

    // 2. Rate Limiting: Prevent requesting a new OTP within 60 seconds (Anti-Spam)
    const timeElapsed = (Date.now() - new Date(pendingRecord.createdAt).getTime()) / 1000;
    if (timeElapsed < 60) {
      const waitTime = Math.ceil(60 - timeElapsed);
      return NextResponse.json(
        { error: `Vui lòng đợi ${waitTime} giây trước khi yêu cầu mã OTP mới.` },
        { status: 429 }
      );
    }

    // 3. Generate new 6-digit OTP & Hash
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otpCode, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes TTL

    // Update pending record
    await prisma.pendingRegistration.update({
      where: { id: pendingRecord.id },
      data: {
        otpHash,
        attempts: 0,
        expiresAt,
        createdAt: new Date()
      }
    });

    // 4. Send email via Nodemailer SMTP Transport
    await sendOtpEmail(normalizedEmail, otpCode);

    return NextResponse.json({
      success: true,
      message: "Đã gửi lại mã xác nhận OTP 6 chữ số mới tới email của bạn!",
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
