import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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

    // 1. Fetch pending registration request
    const pendingRecord = await prisma.pendingRegistration.findUnique({
      where: { email: normalizedEmail }
    });

    if (!pendingRecord) {
      return NextResponse.json(
        { error: "Không tìm thấy yêu cầu đăng ký hoặc mã đã hết hạn. Vui lòng thử lại." },
        { status: 400 }
      );
    }

    // 2. Expiration Check (Strict 5 minutes TTL)
    if (new Date() > pendingRecord.expiresAt) {
      await prisma.pendingRegistration.delete({ where: { id: pendingRecord.id } }).catch(() => {});
      return NextResponse.json(
        { error: "⏰ Mã OTP 6 chữ số đã hết hạn (5 phút). Vui lòng nhấn gửi lại mã mới." },
        { status: 400 }
      );
    }

    // 3. Brute-Force Check: Max 3 failed attempts allowed
    if (pendingRecord.attempts >= 3) {
      await prisma.pendingRegistration.delete({ where: { id: pendingRecord.id } }).catch(() => {});
      return NextResponse.json(
        { error: "⚠️ Bạn đã nhập sai mã OTP quá 3 lần. Mã đã bị hủy vì lý do bảo mật. Vui lòng xin mã mới." },
        { status: 400 }
      );
    }

    // 4. Compare Hashed OTP Code with User Input using bcrypt
    const isOtpValid = await bcrypt.compare(cleanCode, pendingRecord.otpHash);

    if (!isOtpValid) {
      const newAttempts = pendingRecord.attempts + 1;
      
      if (newAttempts >= 3) {
        await prisma.pendingRegistration.delete({ where: { id: pendingRecord.id } }).catch(() => {});
        return NextResponse.json(
          { error: "⚠️ Bạn đã nhập sai mã OTP 3 lần. Mã xác nhận này đã bị hủy. Vui lòng xin mã mới." },
          { status: 400 }
        );
      } else {
        await prisma.pendingRegistration.update({
          where: { id: pendingRecord.id },
          data: { attempts: newAttempts }
        });
        const remaining = 3 - newAttempts;
        return NextResponse.json(
          { error: `❌ Mã OTP không chính xác. Bạn còn ${remaining} lần thử.` },
          { status: 400 }
        );
      }
    }

    // 5. Finalize Authentication State (Create User ONLY AFTER OTP is verified)
    const userData = pendingRecord.userData as {
      passwordHash: string;
      fullname: string;
      username: string;
      role: string;
    };

    // Double check if username/email wasn't taken in the interim
    const duplicateCheck = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { username: userData.username }
        ]
      }
    });

    if (duplicateCheck) {
      await prisma.pendingRegistration.delete({ where: { id: pendingRecord.id } }).catch(() => {});
      return NextResponse.json(
        { error: "Tài khoản hoặc Email này đã tồn tại trên hệ thống." },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        username: userData.username,
        email: normalizedEmail,
        fullname: userData.fullname,
        passwordHash: userData.passwordHash,
        role: userData.role as any,
        isVerified: true
      }
    });

    // Clean up pending registration record
    await prisma.pendingRegistration.delete({ where: { id: pendingRecord.id } }).catch(() => {});

    // Create session token for immediate login
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    });

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
