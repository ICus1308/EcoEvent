import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "MOCK_KEY" });

const SYSTEM_PROMPT = `
Bạn là Trợ lý AI Hỗ trợ Kỹ thuật chuyên nghiệp của nền tảng EcoEvent Hub & Eco-Gear Marketplace.
Nhiệm vụ của bạn:
1. Giải đáp các thắc mắc kỹ thuật, hướng dẫn sử dụng ứng dụng (đăng niêm yết đồ, đặt thuê, thanh toán VietQR, quản lý đơn hàng, kho bãi, đăng ký gói thành viên).
2. Chẩn đoán lỗi ứng dụng thông qua mô tả hoặc hình ảnh ảnh chụp màn hình bị lỗi mà người dùng gửi lên.
3. Trả lời thân thiện, lịch sự, chuyên nghiệp, ngắn gọn bằng Tiếng Việt.
4. Nếu người dùng muốn gặp nhân viên hỗ trợ thật hoặc vấn đề nằm ngoài khả năng của AI (như sự cố thanh toán hoàn tiền, khiếu nại thiết bị hỏng), hãy khuyên người dùng bấm nút "Gặp nhân viên hỗ trợ" hoặc tự động gợi ý tạo vé hỗ trợ (Support Ticket).
`;

export async function POST(req: Request) {
  try {
    const currentUserId = await getAuthenticatedUserId(req);
    const body = await req.json().catch(() => ({}));
    const { action, message, history = [], attachment } = body;

    // Action: Escalation to Human Support Ticket
    if (action === "ESCALATE") {
      if (!currentUserId) {
        return NextResponse.json(
          { success: false, error: "Vui lòng đăng nhập để gửi yêu cầu hỗ trợ trực tiếp" },
          { status: 401 }
        );
      }

      const ticket = await prisma.supportTicket.create({
        data: {
          userId: currentUserId,
          status: "ESCALATED",
          chatHistory: history
        }
      });

      return NextResponse.json({
        success: true,
        ticketId: ticket.id,
        reply: `Duyệt thành công! Yêu cầu hỗ trợ kỹ thuật #${ticket.id.slice(0, 8)} đã được tạo và chuyển tới Chuyên viên Kỹ thuật. Chúng tôi sẽ phản hồi bạn trong thời gian sớm nhất.`
      });
    }

    // AI Chatbot mode
    if (!message && !attachment) {
      return NextResponse.json({ success: false, error: "Tin nhắn không được để trống" }, { status: 400 });
    }

    // Format conversation history for multi-turn Gemini API call
    const contents: any[] = [];

    if (Array.isArray(history)) {
      history.slice(-10).forEach((h: { sender: string; text: string }) => {
        if (h.sender === "user" || h.sender === "ai") {
          contents.push({
            role: h.sender === "user" ? "user" : "model",
            parts: [{ text: h.text }]
          });
        }
      });
    }

    contents.push({
      role: "user",
      parts: [{ text: message || "Vui lòng kiểm tra file đính kèm này giúp tôi." }]
    });

    let replyText = "";

    try {
      if (process.env.GEMINI_API_KEY) {
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: contents,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            temperature: 0.5
          }
        });
        replyText = response.text || "";
      }
    } catch (aiErr) {
      console.error("Gemini API call failed, falling back to rule-based reply:", aiErr);
    }

    // Intelligent Fallback System Prompt Answers if Gemini Key is not set or fails
    if (!replyText) {
      const lowerMsg = (message || "").toLowerCase();
      if (lowerMsg.includes("thuê") || lowerMsg.includes("đặt")) {
        replyText = "Để thuê vật phẩm trên EcoEvent Hub: 1. Chọn sản phẩm ở trang Chợ -> 2. Chọn Ngày thuê & Ngày trả -> 3. Bấm 'Thanh Toán Thuê'. Tiền cọc sẽ được hoàn trả 100% khi trả đồ đúng hạn!";
      } else if (lowerMsg.includes("đăng") || lowerMsg.includes("bán") || lowerMsg.includes("niêm yết")) {
        replyText = "Để đăng niêm yết thiết bị: Vào Kho Hàng (Inventory) -> Bấm 'Đăng Niêm Yết Mới' -> Điền thông tin SKU, hình ảnh, giá thuê/bán và bấm Lưu.";
      } else if (lowerMsg.includes("lỗi") || lowerMsg.includes("không") || lowerMsg.includes("đăng nhập")) {
        replyText = "Nếu bạn gặp lỗi ứng dụng hoặc tài khoản: Bạn có thể thử đăng xuất và đăng nhập lại, hoặc bấm nút 'Gặp nhân viên hỗ trợ' bên dưới để kỹ thuật viên kiểm tra chi tiết hệ thống.";
      } else {
        replyText = "Cảm ơn bạn đã liên hệ bộ phận Hỗ trợ Kỹ thuật EcoEvent Hub! Tôi có thể giúp gì cho bạn về cách đăng niêm yết, quy trình thuê thiết bị hoặc xử lý lỗi kỹ thuật?";
      }
    }

    return NextResponse.json({
      success: true,
      reply: replyText
    });
  } catch (error: any) {
    console.error("Tech support API error:", error);
    return NextResponse.json({ success: false, error: "Lỗi máy chủ khi xử lý yêu cầu AI" }, { status: 500 });
  }
}
