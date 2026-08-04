import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const session = await prisma.session.findUnique({
        where: { token },
        select: { userId: true },
      });
      if (session?.userId) userId = session.userId;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { paymentId, transactionRef } = body;

    if (!paymentId && !transactionRef) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin giao dịch" },
        { status: 400 }
      );
    }

    const payment = await prisma.subscriptionPayment.findFirst({
      where: {
        OR: [
          paymentId ? { id: paymentId } : {},
          transactionRef ? { transactionRef } : {},
        ],
      },
      include: {
        subscription: {
          include: { plan: true },
        },
      },
    });

    if (!payment || payment.subscription.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy thông tin giao dịch hợp lệ" },
        { status: 404 }
      );
    }

    // Activate subscription & mark payment as COMPLETED
    await prisma.$transaction([
      prisma.subscriptionPayment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          paidAt: new Date(),
        },
      }),
      prisma.userSubscription.update({
        where: { id: payment.subscriptionId },
        data: {
          status: "ACTIVE",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Chúc mừng! Bạn đã nâng cấp thành công lên ${payment.subscription.plan.name}!`,
      plan: payment.subscription.plan,
    });
  } catch (error) {
    console.error("Subscription verify error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi máy chủ khi xác nhận thanh toán" },
      { status: 500 }
    );
  }
}
