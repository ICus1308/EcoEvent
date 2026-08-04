import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";

// GET /api/chat/conversations - List conversations for authenticated user
export async function GET(req: Request) {
  try {
    const currentUserId = await getAuthenticatedUserId(req);
    if (!currentUserId) {
      return NextResponse.json({ success: false, error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ participantA: currentUserId }, { participantB: currentUserId }]
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    // Fetch participant user info
    const participantIds: string[] = Array.from(
      new Set(
        conversations.flatMap((c: any) => [c.participantA, c.participantB]).filter((id: string) => id !== currentUserId)
      )
    );

    const users = await prisma.user.findMany({
      where: { id: { in: participantIds } },
      select: { id: true, fullname: true, username: true, role: true }
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const formatted = conversations.map((c: any) => {
      const otherId = c.participantA === currentUserId ? c.participantB : c.participantA;
      const otherUser = userMap.get(otherId) || { id: otherId, fullname: "Người dùng EcoEvent", username: "user", role: "CUSTOMER" };
      const lastMsg = c.messages[0] || null;

      return {
        id: c.id,
        partner: otherUser,
        lastMessage: lastMsg ? {
          content: lastMsg.content,
          type: lastMsg.type,
          createdAt: lastMsg.createdAt,
          senderId: lastMsg.senderId
        } : null,
        updatedAt: c.updatedAt
      };
    });

    return NextResponse.json({ success: true, conversations: formatted });
  } catch (error) {
    console.error("Fetch conversations error:", error);
    return NextResponse.json({ success: false, error: "Lỗi khi lấy danh sách cuộc trò chuyện" }, { status: 500 });
  }
}

// POST /api/chat/conversations - Get or create conversation with a user
export async function POST(req: Request) {
  try {
    const currentUserId = await getAuthenticatedUserId(req);
    if (!currentUserId) {
      return NextResponse.json({ success: false, error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const { recipientId } = await req.json().catch(() => ({}));
    if (!recipientId) {
      return NextResponse.json({ success: false, error: "Thiếu thông tin người nhận" }, { status: 400 });
    }

    if (recipientId === currentUserId) {
      return NextResponse.json({ success: false, error: "Không thể tự trò chuyện với chính mình" }, { status: 400 });
    }

    // Sort IDs to ensure unique participant pair
    const [partA, partB] = [currentUserId, recipientId].sort();

    let conversation = await prisma.conversation.findUnique({
      where: {
        participantA_participantB: {
          participantA: partA,
          participantB: partB
        }
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participantA: partA,
          participantB: partB
        }
      });
    }

    return NextResponse.json({ success: true, conversationId: conversation.id });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json({ success: false, error: "Lỗi tạo cuộc trò chuyện" }, { status: 500 });
  }
}
