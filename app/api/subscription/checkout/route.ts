import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PlanTier, BillingInterval } from "@prisma/client";

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
        { success: false, error: "Vui lòng đăng nhập để nâng cấp gói cước" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { tier, interval } = body as { tier: PlanTier; interval: BillingInterval };

    if (!tier || !["PLUS", "PREMIUM"].includes(tier)) {
      return NextResponse.json(
        { success: false, error: "Gói cước không hợp lệ" },
        { status: 400 }
      );
    }

    const selectedInterval = interval === "YEARLY" ? "YEARLY" : "MONTHLY";

    const plan = await prisma.plan.findUnique({
      where: { tier },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy thông tin gói cước" },
        { status: 404 }
      );
    }

    const amount = selectedInterval === "YEARLY" ? plan.yearlyPrice : plan.monthlyPrice;

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    if (selectedInterval === "YEARLY") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Upsert UserSubscription
    const subscription = await prisma.userSubscription.upsert({
      where: { userId },
      update: {
        planId: plan.id,
        status: "PENDING_PAYMENT",
        interval: selectedInterval,
        startDate,
        endDate,
      },
      create: {
        userId,
        planId: plan.id,
        status: "PENDING_PAYMENT",
        interval: selectedInterval,
        startDate,
        endDate,
      },
    });

    // Create unique transaction reference for VietQR
    const refCode = `ECOSUB${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;

    const payment = await prisma.subscriptionPayment.create({
      data: {
        subscriptionId: subscription.id,
        amount,
        paymentMethod: "VIETQR",
        transactionRef: refCode,
        status: "PENDING",
      },
    });

    // Generate VietQR URL (MB Bank / Vietcombank format for demo)
    // Format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-compact2.png?amount=<AMOUNT>&addInfo=<MEMO>&accountName=<ACCOUNT_NAME>
    const bankId = "MB";
    const accountNo = "0987654321";
    const accountName = "ECO EVENT HUB";
    const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(refCode)}&accountName=${encodeURIComponent(accountName)}`;

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      transactionRef: refCode,
      amount,
      planName: plan.name,
      interval: selectedInterval,
      qrUrl,
      bankInfo: {
        bankName: "Ngân hàng MBBank",
        accountNo,
        accountName,
        refCode,
        amount,
      },
    });
  } catch (error) {
    console.error("Subscription checkout error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi máy chủ khi tạo đơn đăng ký gói" },
      { status: 500 }
    );
  }
}
