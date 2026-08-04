import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { emailOrUsername, password, rememberMe } = body;

    if (!emailOrUsername || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ Email/Tên đăng nhập và Mật khẩu." },
        { status: 400 }
      );
    }

    const query = emailOrUsername.toLowerCase().trim();

    // 1. Try Supabase Auth SignIn first
    const supabase = await createClient();
    const { data: supabaseAuth, error: supabaseError } = await supabase.auth.signInWithPassword({
      email: query,
      password
    });

    if (!supabaseError && supabaseAuth.user) {
      // Check if email is confirmed in Supabase
      if (!supabaseAuth.user.email_confirmed_at) {
        return NextResponse.json(
          {
            unverified: true,
            email: supabaseAuth.user.email,
            error: "Tài khoản của bạn chưa được xác minh qua Email. Vui lòng kiểm tra Hộp thư đến (Inbox) hoặc Spam để click vào link xác nhận."
          },
          { status: 403 }
        );
      }

      // Sync user to Prisma DB if missing or update isVerified = true
      let user = await prisma.user.findFirst({
        where: { OR: [{ email: query }, { username: query }, { id: supabaseAuth.user.id }] }
      });

      if (user) {
        if (!user.isVerified) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { isVerified: true }
          });
        }
      } else {
        user = await prisma.user.create({
          data: {
            id: supabaseAuth.user.id,
            email: supabaseAuth.user.email || query,
            username: supabaseAuth.user.user_metadata?.username || query.split("@")[0],
            fullname: supabaseAuth.user.user_metadata?.fullname || "User",
            passwordHash: "",
            isVerified: true
          }
        });
      }

      // Create session in Prisma DB for session token compatibility
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000);
      await prisma.session.create({
        data: {
          token,
          userId: user.id,
          expiresAt
        }
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        message: "Đăng nhập thành công!",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullname: user.fullname,
          role: user.role
        }
      });
    }

    // 2. Fallback check in Prisma DB (for legacy users or direct login)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: query },
          { username: query }
        ]
      }
    });

    if (user && user.passwordHash) {
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (isPasswordValid) {
        if (!user.isVerified) {
          return NextResponse.json(
            {
              unverified: true,
              email: user.email,
              error: "Tài khoản của bạn chưa được xác minh qua Email. Vui lòng kiểm tra Hộp thư đến (Inbox) để click vào link xác nhận."
            },
            { status: 403 }
          );
        }

        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000);

        await prisma.session.create({
          data: {
            token,
            userId: user.id,
            expiresAt
          }
        }).catch(() => {});

        return NextResponse.json({
          success: true,
          message: "Đăng nhập thành công!",
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            fullname: user.fullname,
            role: user.role
          }
        });
      }
    }

    return NextResponse.json(
      { error: "Tài khoản hoặc mật khẩu không chính xác." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra trong quá trình đăng nhập." },
      { status: 500 }
    );
  }
}
