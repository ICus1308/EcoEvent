import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";

// GET /api/chat/messages?conversationId=... - Fetch messages of a conversation
export async function GET(req: Request) {
  try {
    const currentUserId = await getAuthenticatedUserId(req);
    if (!currentUserId) {
      return NextResponse.json({ success: false, error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json({ success: false, error: "Thiếu conversationId" }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation || (conversation.participantA !== currentUserId && conversation.participantB !== currentUserId)) {
      return NextResponse.json({ success: false, error: "Không tìm thấy hoặc không có quyền truy cập cuộc trò chuyện" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: { attachments: true },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("Fetch messages error:", error);
    return NextResponse.json({ success: false, error: "Lỗi lấy danh sách tin nhắn" }, { status: 500 });
  }
}

// POST /api/chat/messages - Send a message (text, image, video, product link)
export async function POST(req: Request) {
  try {
    const currentUserId = await getAuthenticatedUserId(req);
    if (!currentUserId) {
      return NextResponse.json({ success: false, error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { conversationId, content, type = "TEXT", attachmentUrls = [] } = body;

    if (!conversationId) {
      return NextResponse.json({ success: false, error: "Thiếu conversationId" }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation || (conversation.participantA !== currentUserId && conversation.participantB !== currentUserId)) {
      return NextResponse.json({ success: false, error: "Không có quyền gửi tin nhắn vào cuộc trò chuyện này" }, { status: 403 });
    }

    // Create message with attachments
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: currentUserId,
        content: content || "",
        type: type as any,
        attachments: {
          create: attachmentUrls.map((url: string) => ({
            fileUrl: url,
            fileType: type === "VIDEO" ? "VIDEO" : "IMAGE"
          }))
        }
      },
      include: { attachments: true }
    });

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ success: false, error: "Lỗi gửi tin nhắn" }, { status: 500 });
  }
}
