import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp email." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = await createClient();
    const origin = req.headers.get("origin") || "http://localhost:3000";

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${origin}/auth/callback`
      }
    });

    if (error) {
      console.error("Resend Verification Error:", error);
      return NextResponse.json(
        { error: error.message || "Không thể gửi lại email xác nhận. Vui lòng thử lại sau." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đã gửi lại email xác nhận thành công! Vui lòng kiểm tra Hộp thư đến hoặc thư Rác (Spam)."
    });
  } catch (error: any) {
    console.error("Resend Verification Error:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ khi gửi lại email xác nhận." },
      { status: 500 }
    );
  }
}
