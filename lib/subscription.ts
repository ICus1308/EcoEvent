import { prisma } from "@/lib/prisma";

export async function getUserPlan(userId: string) {
  try {
    const userSub = await prisma.userSubscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    // If subscription exists, is ACTIVE, and hasn't expired
    if (
      userSub &&
      userSub.status === "ACTIVE" &&
      new Date(userSub.endDate) > new Date()
    ) {
      return {
        plan: userSub.plan,
        subscription: userSub,
        isDefaultFree: false,
      };
    }

    // Default to FREE plan
    const freePlan = await prisma.plan.findUnique({
      where: { tier: "FREE" },
    });

    return {
      plan: freePlan || {
        id: "free",
        tier: "FREE" as const,
        name: "Gói Cơ Bản",
        monthlyPrice: 0,
        yearlyPrice: 0,
        aiLimitPerMonth: 2,
        maxListings: 3,
        platformFeePct: 5.0,
        hasPdfExport: false,
        hasTopSearch: false,
        hasPortal: false,
        hasAnalytics: false,
      },
      subscription: userSub || null,
      isDefaultFree: true,
    };
  } catch (error) {
    console.error("Error fetching user plan:", error);
    // Fallback default FREE limits
    return {
      plan: {
        id: "free",
        tier: "FREE" as const,
        name: "Gói Cơ Bản",
        monthlyPrice: 0,
        yearlyPrice: 0,
        aiLimitPerMonth: 2,
        maxListings: 3,
        platformFeePct: 5.0,
        hasPdfExport: false,
        hasTopSearch: false,
        hasPortal: false,
        hasAnalytics: false,
      },
      subscription: null,
      isDefaultFree: true,
    };
  }
}

export async function canCreateProduct(userId: string) {
  const { plan } = await getUserPlan(userId);
  
  if (plan.maxListings === -1) {
    return { allowed: true, limit: -1, currentCount: 0, planName: plan.name };
  }

  const currentCount = await prisma.product.count({
    where: {
      ownerId: userId,
      status: { not: "INACTIVE" },
    },
  });

  return {
    allowed: currentCount < plan.maxListings,
    limit: plan.maxListings,
    currentCount,
    planName: plan.name,
  };
}

export async function canUseAiPlanner(userId: string) {
  const { plan } = await getUserPlan(userId);

  if (plan.aiLimitPerMonth === -1) {
    return { allowed: true, limit: -1, currentCount: 0, planName: plan.name };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { aiUsageCount: true, lastAiReset: true },
  });

  if (!user) {
    return { allowed: false, limit: plan.aiLimitPerMonth, currentCount: 0, planName: plan.name };
  }

  // Check if reset month has passed
  const now = new Date();
  const lastReset = new Date(user.lastAiReset);
  let currentCount = user.aiUsageCount;

  if (
    now.getMonth() !== lastReset.getMonth() ||
    now.getFullYear() !== lastReset.getFullYear()
  ) {
    // Reset counter for new month
    await prisma.user.update({
      where: { id: userId },
      data: { aiUsageCount: 0, lastAiReset: now },
    });
    currentCount = 0;
  }

  return {
    allowed: currentCount < plan.aiLimitPerMonth,
    limit: plan.aiLimitPerMonth,
    currentCount,
    planName: plan.name,
  };
}

export async function incrementAiUsage(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        aiUsageCount: { increment: 1 },
      },
    });
  } catch (err) {
    console.error("Failed to increment AI usage count:", err);
  }
}
