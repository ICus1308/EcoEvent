import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "MOCK_KEY" });

const SYSTEM_PROMPT = `
Bạn là Trợ lý AI Hỗ trợ Kỹ thuật và Chăm sóc Khách hàng chuyên nghiệp của nền tảng EcoEvent Hub & Eco-Gear Marketplace.

GIỚI THIỆU VỀ ECOEVENT HUB:
- Đây là nền tảng sự kiện sinh thái & kinh tế chia sẻ đầu tiên. Nền tảng giúp lập kế hoạch sự kiện xanh hơn và chia sẻ tài nguyên thông minh.
- Tính năng AI Planner (sử dụng Gemini): Lập kế hoạch sự kiện bền vững, tạo dòng thời gian (timeline), tính toán chi phí tiết kiệm so với truyền thống, và ước tính lượng rác thải nhựa được giảm thiểu.
- Chợ Eco-Gear (Shop): Nơi người dùng có thể thuê hoặc mua các sản phẩm thân thiện với môi trường (ví dụ: bộ đồ ăn bằng tre, khung backdrop tái chế, bộ đàm).
- Hệ thống thanh toán: Hỗ trợ thanh toán và ký quỹ (cọc) an toàn qua mã VietQR. Tiền cọc thuê đồ được bảo vệ 100% và hoàn trả sau khi trả đồ đúng hạn.
- Kho hàng (Inventory): Dành cho nhà cung cấp/host để đăng niêm yết thiết bị (thêm hình ảnh, giá thuê/bán, SKU, số lượng).

CÁC GÓI THÀNH VIÊN (PRICING):
1. Gói Cơ bản (Miễn phí): 2 lượt AI Planner/tháng, tối đa 3 vật phẩm niêm yết trên chợ, phí dịch vụ sàn 5.0%.
2. Gói Plus (49,000đ/tháng hoặc 470,000đ/năm): 20 lượt AI Planner/tháng, tối đa 10 vật phẩm niêm yết, phí dịch vụ sàn 3.5%, có huy hiệu Verified Eco Host.
3. Gói Premium (99,000đ/tháng hoặc 950,000đ/năm): Không giới hạn lượt AI, không giới hạn vật phẩm, phí dịch vụ sàn 2.0%, hỗ trợ xuất PDF/Excel, có tính năng Top-Search Boost và Portal riêng.

NHIỆM VỤ CỦA BẠN:
1. Giải đáp chi tiết các thắc mắc của người dùng về cách sử dụng ứng dụng: cách đăng niêm yết đồ, đặt thuê, thanh toán VietQR, quản lý đơn hàng, kho bãi, đăng ký và lợi ích của các gói thành viên.
2. Chẩn đoán lỗi ứng dụng thông qua mô tả hoặc hình ảnh ảnh chụp màn hình bị lỗi mà người dùng gửi lên.
3. Luôn trả lời thân thiện, lịch sự, chuyên nghiệp, súc tích và HOÀN TOÀN BẰNG TIẾNG VIỆT.
4. Xử lý leo thang (Escalate): Nếu vấn đề vượt quá khả năng của AI (như lỗi không hoàn tiền cọc, khiếu nại thiết bị hỏng, tranh chấp đơn hàng), hãy khuyên người dùng bấm nút "Gặp nhân viên hỗ trợ" ở phía dưới chat để tự động tạo Support Ticket.
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
          model: "gemini-3.6-flash",
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
