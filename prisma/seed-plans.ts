import { prisma } from "../lib/prisma";

async function main() {
  console.log("Seeding subscription plans...");

  const plans = [
    {
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
    {
      tier: "PLUS" as const,
      name: "Gói Plus",
      monthlyPrice: 99000,
      yearlyPrice: 990000,
      aiLimitPerMonth: -1, // Unlimited
      maxListings: 15,
      platformFeePct: 3.0,
      hasPdfExport: true,
      hasTopSearch: false,
      hasPortal: false,
      hasAnalytics: false,
    },
    {
      tier: "PREMIUM" as const,
      name: "Gói Premium Vendor",
      monthlyPrice: 299000,
      yearlyPrice: 2990000,
      aiLimitPerMonth: -1, // Unlimited
      maxListings: -1, // Unlimited
      platformFeePct: 1.5,
      hasPdfExport: true,
      hasTopSearch: true,
      hasPortal: true,
      hasAnalytics: true,
    },
  ];

  for (const planData of plans) {
    await prisma.plan.upsert({
      where: { tier: planData.tier },
      update: planData,
      create: planData,
    });
    console.log(`- Plan ${planData.name} (${planData.tier}) seeded.`);
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
