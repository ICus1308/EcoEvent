import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

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

    // Check if email or username already exists in Prisma DB
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

    // 1. Trigger Supabase Auth Signup (sends confirmation email automatically via Supabase default provider)
    const supabase = await createClient();
    const origin = req.headers.get("origin") || "http://localhost:3000";
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          username: normalizedUsername,
          fullname: cleanFullname,
          role
        }
      }
    });

    if (authError) {
      console.error("Supabase Auth SignUp Error:", authError);
      return NextResponse.json(
        { error: authError.message || "Không thể đăng ký với Supabase Auth." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // 2. Create user record in Prisma DB (isVerified = false until email confirmation link is clicked)
    const user = await prisma.user.create({
      data: {
        id: authData.user?.id || undefined,
        username: normalizedUsername,
        email: normalizedEmail,
        fullname: cleanFullname,
        passwordHash,
        role: role as any,
        isVerified: false
      }
    });

    return NextResponse.json({
      success: true,
      requireVerification: true,
      message: "Đăng ký thành công! Vui lòng kiểm tra hộp thư đến (Inbox hoặc Spam) để xác minh tài khoản.",
      email: normalizedEmail
    });
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra trong quá trình xử lý đăng ký." },
      { status: 500 }
    );
  }
}
