import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

if (globalForPrisma.prisma) {
  prismaInstance = globalForPrisma.prisma;
} else {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("❌ ERROR: DATABASE_URL is missing in your .env file!");
    // Fallback stub to prevent immediate app crash on startup before first DB query
    prismaInstance = new Proxy({} as PrismaClient, {
      get() {
        throw new Error("DATABASE_URL chưa được cấu hình trong file .env. Vui lòng thêm DATABASE_URL='postgresql://...' vào .env!");
      }
    });
  } else if (connectionString.startsWith("postgres://") || connectionString.startsWith("postgresql://")) {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prismaInstance = new PrismaClient({ adapter, log: ["query"] });
  } else {
    prismaInstance = new PrismaClient({
      accelerateUrl: connectionString,
      log: ["query"],
    });
  }
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaInstance;
