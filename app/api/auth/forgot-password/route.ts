import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendPasswordResetEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp địa chỉ email." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if user exists in the main DB
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      // Security best practice: Don't reveal if the email is registered or not.
      // But for better UX in a school project, we can optionally inform them.
      return NextResponse.json(
        { error: "Không tìm thấy tài khoản với email này." },
        { status: 404 }
      );
    }

    // 2. Clean up expired tokens globally (Lazy cleanup)
    await prisma.passwordResetRequest.deleteMany({
      where: { expiresAt: { lt: new Date() } }
    }).catch(() => {});

    // 3. Rate Limiting (Anti-Spam): Prevent requesting < 60s
    const existingReq = await prisma.passwordResetRequest.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingReq) {
      const timeElapsed = (Date.now() - new Date(existingReq.createdAt).getTime()) / 1000;
      if (timeElapsed < 60) {
        const waitTime = Math.ceil(60 - timeElapsed);
        return NextResponse.json(
          { error: `Vui lòng đợi ${waitTime} giây trước khi yêu cầu mã mới.` },
          { status: 429 }
        );
      }
    }

    // 4. Generate secure 6-digit OTP & Hash it
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otpCode, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins TTL

    // 5. Save securely in DB
    await prisma.passwordResetRequest.upsert({
      where: { email: normalizedEmail },
      update: {
        otpHash,
        attempts: 0,
        expiresAt,
        createdAt: new Date()
      },
      create: {
        email: normalizedEmail,
        otpHash,
        attempts: 0,
        expiresAt
      }
    });

    // 6. Send the email
    await sendPasswordResetEmail(normalizedEmail, otpCode);

    return NextResponse.json({
      success: true,
      message: "Mã xác nhận 6 chữ số đã được gửi tới email của bạn.",
      otpDebug: process.env.NODE_ENV !== "production" ? otpCode : undefined
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi trên máy chủ. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
