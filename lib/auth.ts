import { prisma } from "@/lib/prisma";

export async function getAuthenticatedUserId(req: Request): Promise<string | null> {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);

    // 1. Check for demo-token (base64url JSON)
    if (token.startsWith("demo-token-")) {
      try {
        const encoded = token.replace("demo-token-", "");
        const userData = JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8"));
        if (userData?.id) return userData.id;
      } catch (e) {}
    }

    // 2. Check for simple base64 JSON token
    try {
      const decodedStr = Buffer.from(token.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
      const decoded = JSON.parse(decodedStr);
      if (decoded?.id || decoded?.userId) {
        return decoded.id || decoded.userId;
      }
    } catch (e) {}

    // 3. Check Prisma Session DB table
    try {
      const session = await prisma.session.findUnique({
        where: { token },
        select: { userId: true, expiresAt: true }
      });
      if (session && new Date() <= session.expiresAt) {
        return session.userId;
      }
    } catch (e) {}

    return null;
  } catch (e) {
    return null;
  }
}
