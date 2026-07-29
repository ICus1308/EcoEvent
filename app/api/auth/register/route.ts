import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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

    const { prisma } = await import("@/lib/prisma");

    // Check if email or username already exists
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

    const passwordHash = await bcrypt.hash(password, 10);

    // 1. Create user with isVerified = false
    const user = await prisma.user.create({
      data: {
        username: normalizedUsername,
        email: normalizedEmail,
        fullname: cleanFullname,
        passwordHash,
        role: role as any,
        isVerified: false
      }
    });

    // 2. Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expiration: 10 minutes

    // Delete any old OTPs for this email & create new code
    await prisma.verificationCode.deleteMany({ where: { email: normalizedEmail } }).catch(() => {});
    await prisma.verificationCode.create({
      data: {
        email: normalizedEmail,
        code: otpCode,
        expiresAt
      }
    });

    // 3. Trigger Real SMTP Email Sending (with Console Fallback)
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
