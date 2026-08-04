"use client";

import React, { useState, useRef, useEffect } from "react";
import { Headset, X, Send, Image, Video, User, Bot, Loader2, Paperclip, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";

interface ChatMessage {
  id: string;
  sender: "user" | "ai" | "system";
  text: string;
  attachmentUrl?: string;
  attachmentType?: "IMAGE" | "VIDEO";
  timestamp: string;
}

export default function TechSupportBubble({
  isOpen,
  onToggle
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "ai",
      text: "Xin chào! Tôi là Trợ lý AI Hỗ trợ Kỹ thuật EcoEvent Hub. Bạn đang gặp sự cố về ứng dụng, cách đăng sản phẩm hay thuê thiết bị? Tôi sẵn sàng giúp bạn 24/7!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ url: string; type: "IMAGE" | "VIDEO" } | null>(null);
  const [escalated, setEscalated] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      alert("Vui lòng chọn file hình ảnh hoặc video.");
      return;
    }

    const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5MB

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      alert("Kích thước video vượt quá 50MB giới hạn.");
      return;
    }
    
    if (isImage && file.size > MAX_IMAGE_SIZE) {
      alert("Kích thước ảnh vượt quá 5MB giới hạn.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();

      if (data.url || data.success) {
        setSelectedFile({
          url: data.url || data.path,
          type: isVideo ? "VIDEO" : "IMAGE"
        });
      } else {
        alert(data.error || "Tải file lên thất bại");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Lỗi máy chủ khi tải đính kèm");
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && !selectedFile) || loading) return;

    const userText = input.trim();
    const attachment = selectedFile;
    setInput("");
    setSelectedFile(null);

    const newMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: userText,
      attachmentUrl: attachment?.url,
      attachmentType: attachment?.type,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("sessionToken") : null;
      const res = await fetch("/api/chat/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: userText,
          history: messages.map((m) => ({ sender: m.sender, text: m.text })),
          attachment: attachment?.url
        })
      });

      const data = await res.json();

      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: "system",
            text: data.error || "Không thể nhận phản hồi từ AI Bot.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "system",
          text: "Lỗi kết nối mạng đến bộ phận Hỗ trợ AI.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("sessionToken") : null;
      const res = await fetch("/api/chat/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          action: "ESCALATE",
          history: messages.map((m) => ({ sender: m.sender, text: m.text }))
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEscalated(true);
        setMessages((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            sender: "system",
            text: data.reply || "Yêu cầu hỗ trợ trực tiếp đã được tạo!",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      } else {
        alert(data.error || "Vui lòng đăng nhập để gửi yêu cầu hỗ trợ trực tiếp.");
      }
    } catch (err) {
      alert("Không thể kết nối đến máy chủ hỗ trợ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Floating Trigger Button (Upper) */}
      <button
        onClick={onToggle}
        className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white p-3.5 rounded-full shadow-lg shadow-emerald-900/20 hover:scale-105 transition-all duration-200"
        title="Hỗ Trợ Kỹ Thuật & AI Chatbot"
      >
        <Headset className="h-6 w-6" />
        <span className="hidden md:inline font-bold text-xs pr-1">Hỗ Trợ AI</span>
      </button>

      {/* Expandable Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[90vw] sm:w-[380px] h-[520px] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-800 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Bot className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  AI Tech Support 24/7
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[11px] text-emerald-100/80">Trợ lý hỗ trợ kỹ thuật & xử lý sự cố</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-white/80 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === "user"
                    ? "items-end"
                    : m.sender === "system"
                    ? "items-center text-center"
                    : "items-start"
                }`}
              >
                {m.sender === "system" ? (
                  <div className="my-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-1.5 max-w-[90%]">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-600" />
                    <span>{m.text}</span>
                  </div>
                ) : (
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-sm ${
                      m.sender === "user"
                        ? "bg-emerald-600 text-white rounded-br-none"
                        : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-none"
                    }`}
                  >
                    {m.attachmentUrl && (
                      <div className="mb-2 rounded-xl overflow-hidden border border-slate-100 max-h-48">
                        {m.attachmentType === "VIDEO" ? (
                          <video src={m.attachmentUrl} controls className="w-full h-auto" />
                        ) : (
                          <img src={m.attachmentUrl} alt="Attachment" className="w-full h-auto object-cover" />
                        )}
                      </div>
                    )}
                    <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                    <span
                      className={`block text-[10px] mt-1 text-right ${
                        m.sender === "user" ? "text-emerald-100" : "text-slate-400"
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-2.5 rounded-2xl border border-slate-200 w-fit">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                <span>AI Support đang suy nghĩ...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Escalation Action Banner */}
          {!escalated && (
            <div className="px-3 py-2 bg-indigo-50/80 border-t border-indigo-100 flex items-center justify-between text-xs">
              <span className="text-indigo-900 font-medium truncate">AI chưa giải quyết được?</span>
              <button
                onClick={handleEscalate}
                disabled={loading}
                className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline flex items-center gap-1 shrink-0"
              >
                Gặp nhân viên thật
              </button>
            </div>
          )}

          {/* Attachment Preview */}
          {selectedFile && (
            <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="truncate text-slate-700 font-medium">
                Đã chọn {selectedFile.type === "VIDEO" ? "Video" : "Hình ảnh"}
              </span>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-red-600 font-bold hover:underline"
              >
                Hủy
              </button>
            </div>
          )}

          {/* Input Bar */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,video/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || loading}
              className="p-2 text-slate-400 hover:text-emerald-600 rounded-xl hover:bg-slate-100 transition-colors"
              title="Đính kèm ảnh/video sự cố"
            >
              {uploading ? <Loader2 className="h-5 w-5 animate-spin text-emerald-600" /> : <Paperclip className="h-5 w-5" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập thắc mắc hoặc báo lỗi..."
              disabled={loading}
              className="flex-1 text-xs sm:text-sm px-3.5 py-2 rounded-xl bg-slate-100 border-none focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900"
            />

            <button
              type="submit"
              disabled={loading || (!input.trim() && !selectedFile)}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl transition-all shadow-sm"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
