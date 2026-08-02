import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, code, newPassword } = body;

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp đầy đủ thông tin (Email, Mã OTP và Mật khẩu mới)." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải có ít nhất 6 ký tự." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    // 1. Fetch pending password reset request
    const resetRecord = await prisma.passwordResetRequest.findUnique({
      where: { email: normalizedEmail }
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: "Yêu cầu không tồn tại hoặc đã hết hạn. Vui lòng thử lại." },
        { status: 400 }
      );
    }

    // 2. Expiration Check (10 mins TTL)
    if (new Date() > resetRecord.expiresAt) {
      await prisma.passwordResetRequest.delete({ where: { id: resetRecord.id } }).catch(() => {});
      return NextResponse.json(
        { error: "⏰ Mã OTP đã hết hạn (10 phút). Vui lòng nhấn gửi lại mã mới." },
        { status: 400 }
      );
    }

    // 3. Brute-Force Check: Max 3 failed attempts
    if (resetRecord.attempts >= 3) {
      await prisma.passwordResetRequest.delete({ where: { id: resetRecord.id } }).catch(() => {});
      return NextResponse.json(
        { error: "⚠️ Bạn đã nhập sai mã OTP quá 3 lần. Mã đã bị hủy vì lý do bảo mật." },
        { status: 400 }
      );
    }

    // 4. Compare Hashed OTP
    const isOtpValid = await bcrypt.compare(cleanCode, resetRecord.otpHash);

    if (!isOtpValid) {
      const newAttempts = resetRecord.attempts + 1;
      
      if (newAttempts >= 3) {
        await prisma.passwordResetRequest.delete({ where: { id: resetRecord.id } }).catch(() => {});
        return NextResponse.json(
          { error: "⚠️ Bạn đã nhập sai mã OTP 3 lần. Mã này đã bị vô hiệu hóa." },
          { status: 400 }
        );
      } else {
        await prisma.passwordResetRequest.update({
          where: { id: resetRecord.id },
          data: { attempts: newAttempts }
        });
        const remaining = 3 - newAttempts;
        return NextResponse.json(
          { error: `❌ Mã OTP không chính xác. Bạn còn ${remaining} lần thử.` },
          { status: 400 }
        );
      }
    }

    // 5. Change Password
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return NextResponse.json({ error: "Người dùng không tồn tại." }, { status: 404 });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash }
    });

    // Clean up reset record & Invalidate all old sessions for security
    await prisma.passwordResetRequest.delete({ where: { id: resetRecord.id } }).catch(() => {});
    await prisma.session.deleteMany({ where: { userId: user.id } }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Đổi mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới."
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi đổi mật khẩu." },
      { status: 500 }
    );
  }
}
