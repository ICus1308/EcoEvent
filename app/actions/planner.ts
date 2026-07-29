"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateEventPlan(params: {
  eventType: string;
  guestCount: number;
  budget: number;
  ecoLevel: string;
}) {
  try {
    const prompt = `
      Bạn là một chuyên gia tổ chức sự kiện bền vững (eco-friendly event planner).
      Hãy tạo một kế hoạch sự kiện thực tế, thân thiện với môi trường cho loại sự kiện: "${params.eventType}", với ${params.guestCount} khách mời, mục tiêu ngân sách là ${params.budget} VND, và mức độ thân thiện môi trường là "${params.ecoLevel}".
      
      YÊU CẦU QUAN TRỌNG: 
      1. TẤT CẢ văn bản phản hồi phải bằng Tiếng Việt.
      2. Nếu ngân sách (${params.budget} VND) không khả thi cho ${params.guestCount} khách, hãy đề xuất các lựa chọn thay thế hoặc điều chỉnh hợp lý trong phần task.
      
      Bạn PHẢI trả về DUY NHẤT một chuỗi JSON thô (không có định dạng Markdown, không có dấu backticks) khớp chính xác với cấu trúc sau:
      {
        "timeline": [
          { "time": "chuỗi thời gian (vd: 08:00 AM)", "task": "chuỗi mô tả công việc (hành động cụ thể, có thể bao gồm đề xuất nếu ngân sách không khả thi)" }
        ],
        "costComparison": {
          "traditional": số (chi phí ước tính cho sự kiện truyền thống),
          "ecoFriendly": số (chi phí ước tính cho sự kiện xanh này),
          "savings": số (traditional - ecoFriendly)
        }
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    let rawText = response.text;
    // Strip markdown formatting if the model still returns it despite instructions
    if (rawText && rawText.startsWith("```json")) {
      rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    }
    
    return JSON.parse(rawText || "{}");
  } catch (error) {
    console.error("Error generating event plan:", error);
    throw new Error("Failed to generate plan");
  }
}
