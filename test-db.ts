import { prisma } from "./lib/prisma";

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users in DB:", users.length);
}

main().catch(console.error).finally(() => process.exit(0));
