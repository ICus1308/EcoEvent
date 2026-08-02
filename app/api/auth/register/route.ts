import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { username, email, fullname, password, role = "CUSTOMER" } = body;

    if (!username || !email || !fullname || !password) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ các thông tin: Tên đăng nhập, Email, Họ tên và Mật khẩu." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.toLowerCase().trim();
    const cleanFullname = fullname.trim();

    // 1. Check if user already exists in main User table
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { username: normalizedUsername }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return NextResponse.json(
          { error: "Email này đã được đăng ký. Vui lòng chọn email khác hoặc đăng nhập." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác." },
        { status: 400 }
      );
    }

    // 2. Lazy Cleanup of expired pending registration requests
    await prisma.pendingRegistration.deleteMany({
      where: { expiresAt: { lt: new Date() } }
    }).catch(() => {});

    // 3. Rate Limiting: Prevent requesting a new OTP within 60 seconds (Anti-Spam)
    const existingPending = await prisma.pendingRegistration.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingPending) {
      const timeElapsed = (Date.now() - new Date(existingPending.createdAt).getTime()) / 1000;
      if (timeElapsed < 60) {
        const waitTime = Math.ceil(60 - timeElapsed);
        return NextResponse.json(
          { error: `Vui lòng đợi ${waitTime} giây trước khi yêu cầu mã OTP mới.` },
          { status: 429 }
        );
      }
    }

    // 4. Cryptographically Secure 6-digit OTP Generation & Hashing
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otpCode, 10);
    const passwordHash = await bcrypt.hash(password, 10);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes TTL

    const userData = {
      passwordHash,
      fullname: cleanFullname,
      username: normalizedUsername,
      role
    };

    // 5. Store pending registration in database using Upsert (prevents race conditions)
    await prisma.pendingRegistration.upsert({
      where: { email: normalizedEmail },
      update: {
        userData,
        otpHash,
        attempts: 0,
        expiresAt,
        createdAt: new Date()
      },
      create: {
        email: normalizedEmail,
        userData,
        otpHash,
        attempts: 0,
        expiresAt
      }
    });

    // 6. Send OTP via Nodemailer SMTP Transport
    await sendOtpEmail(normalizedEmail, otpCode);

    return NextResponse.json({
      success: true,
      requireOtp: true,
      message: "Mã xác thực 6 chữ số đã được gửi tới email của bạn!",
      email: normalizedEmail,
      otpDebug: process.env.NODE_ENV !== "production" ? otpCode : undefined
    });
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra trong quá trình xử lý đăng ký." },
      { status: 500 }
    );
  }
}
