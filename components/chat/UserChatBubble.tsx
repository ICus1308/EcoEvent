"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Paperclip, Loader2, Image, Video, User, ChevronLeft, ExternalLink, ShoppingBag } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface ConversationItem {
  id: string;
  partner: {
    id: string;
    fullname: string;
    username: string;
    role: string;
  };
  lastMessage: {
    content: string;
    type: string;
    createdAt: string;
    senderId: string;
  } | null;
  updatedAt: string;
}

interface MessageItem {
  id: string;
  senderId: string;
  content: string;
  type: "TEXT" | "IMAGE" | "VIDEO" | "PRODUCT_LINK";
  createdAt: string;
  attachments?: { id: string; fileUrl: string; fileType: string }[];
}

export default function UserChatBubble({
  isOpen,
  onToggle
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [activePartner, setActivePartner] = useState<any>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<{ url: string; type: "IMAGE" | "VIDEO" } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch Conversations list
  useEffect(() => {
    if (!user || !isOpen) return;

    async function loadConversations() {
      try {
        const token = localStorage.getItem("sessionToken");
        const res = await fetch("/api/chat/conversations", {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (data.success && data.conversations) {
          setConversations(data.conversations);
        }
      } catch (err) {
        console.error("Load conversations failed:", err);
      }
    }

    loadConversations();
    
    const supabase = createClient();
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Conversation' },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isOpen]);

  // Fetch Messages when active conversation changes
  useEffect(() => {
    if (!activeConvId || !isOpen) return;

    async function loadMessages() {
      try {
        const token = localStorage.getItem("sessionToken");
        const res = await fetch(`/api/chat/messages?conversationId=${activeConvId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (data.success && data.messages) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.error("Load messages failed:", err);
      }
    }

    loadMessages();
    
    const supabase = createClient();
    const channel = supabase
      .channel(`messages-${activeConvId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'Message', filter: `conversationId=eq.${activeConvId}` },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConvId, isOpen]);

  useEffect(() => {
    if (activeConvId) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeConvId]);

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
        setSelectedAttachment({
          url: data.url || data.path,
          type: isVideo ? "VIDEO" : "IMAGE"
        });
      } else {
        alert(data.error || "Không thể upload file đính kèm");
      }
    } catch (err) {
      alert("Lỗi tải file đính kèm");
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && !selectedAttachment) || !activeConvId || sending) return;

    const textContent = input.trim();
    const attachment = selectedAttachment;
    setInput("");
    setSelectedAttachment(null);
    setSending(true);

    try {
      const token = localStorage.getItem("sessionToken");
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          conversationId: activeConvId,
          content: textContent,
          type: attachment ? attachment.type : "TEXT",
          attachmentUrls: attachment ? [attachment.url] : []
        })
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setSending(false);
    }
  };

  const totalUnread = conversations.length;

  return (
    <div className="relative">
      {/* Floating Trigger Button (Lower) */}
      <button
        onClick={onToggle}
        className="relative flex items-center gap-2 bg-slate-900 hover:bg-black text-white p-3.5 rounded-full shadow-lg hover:scale-105 transition-all duration-200"
        title="Nhắn tin P2P giữa Người thuê & Chủ thiết bị"
      >
        <MessageSquare className="h-6 w-6 text-emerald-400" />
        <span className="hidden md:inline font-bold text-xs pr-1">Tin nhắn</span>
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
            {totalUnread}
          </span>
        )}
      </button>

      {/* Expandable Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[90vw] sm:w-[380px] h-[520px] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
            {activeConvId ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveConvId(null);
                    setActivePartner(null);
                  }}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div>
                  <h3 className="font-bold text-sm leading-tight text-white">
                    {activePartner?.fullname || "Người dùng"}
                  </h3>
                  <p className="text-[10px] text-emerald-400 font-medium capitalize">
                    {activePartner?.role || "Thành viên EcoEvent"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <MessageSquare className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm leading-tight">Tin nhắn</h3>
                  <p className="text-[10px] text-slate-400">Trao đổi vật phẩm & lịch thuê</p>
                </div>
              </div>
            )}

            <button
              onClick={onToggle}
              className="h-8 w-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body Content */}
          {!user ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-slate-50">
              <ShoppingBag className="h-10 w-10 text-slate-400 mb-3" />
              <h4 className="font-bold text-slate-800 text-sm mb-1">Vui lòng đăng nhập</h4>
              <p className="text-xs text-slate-500 mb-4">Bạn cần đăng nhập để trao đổi về thiết bị và nhận thông báo từ người cho thuê.</p>
              <Link href="/login">
                <button className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl">
                  Đăng Nhập Ngay
                </button>
              </Link>
            </div>
          ) : !activeConvId ? (
            /* Conversations List */
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Chưa có cuộc trò chuyện nào. Hãy chọn một sản phẩm ở Chợ Xanh và bấm "Liên hệ chủ đồ"!
                </div>
              ) : (
                conversations.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveConvId(c.id);
                      setActivePartner(c.partner);
                    }}
                    className="p-3.5 hover:bg-white cursor-pointer transition-colors flex items-center gap-3"
                  >
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold shrink-0 text-sm">
                      {c.partner.fullname?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{c.partner.fullname}</h4>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {c.lastMessage?.content || "Vừa khởi tạo cuộc trò chuyện"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Active Chat Window */
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/60">
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((m) => {
                  const isMe = m.senderId === user.id;
                  return (
                    <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-sm ${
                          isMe
                            ? "bg-slate-900 text-white rounded-br-none"
                            : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                        }`}
                      >
                        {m.attachments && m.attachments.length > 0 && (
                          <div className="mb-2 rounded-xl overflow-hidden border border-slate-100 max-h-48">
                            {m.attachments[0].fileType === "VIDEO" ? (
                              <video src={m.attachments[0].fileUrl} controls className="w-full h-auto" />
                            ) : (
                              <img src={m.attachments[0].fileUrl} alt="Item Attachment" className="w-full h-auto object-cover" />
                            )}
                          </div>
                        )}
                        <p className="whitespace-pre-line leading-relaxed">{m.content}</p>
                        <span
                          className={`block text-[10px] mt-1 text-right ${
                            isMe ? "text-slate-400" : "text-slate-400"
                          }`}
                        >
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Selected Attachment Preview */}
              {selectedAttachment && (
                <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="truncate text-slate-700 font-medium">
                    Đính kèm: {selectedAttachment.type === "VIDEO" ? "Video" : "Hình ảnh"}
                  </span>
                  <button onClick={() => setSelectedAttachment(null)} className="text-red-600 font-bold hover:underline">
                    Hủy
                  </button>
                </div>
              )}

              {/* Chat Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
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
                  disabled={uploading || sending}
                  className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                  title="Gửi ảnh tình trạng đồ / video"
                >
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin text-emerald-600" /> : <Paperclip className="h-5 w-5" />}
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  disabled={sending}
                  className="flex-1 text-xs sm:text-sm px-3.5 py-2 rounded-xl bg-slate-100 border-none focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-900"
                />

                <button
                  type="submit"
                  disabled={sending || (!input.trim() && !selectedAttachment)}
                  className="p-2.5 bg-slate-900 hover:bg-black disabled:opacity-50 text-white rounded-xl transition-all shadow-sm"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
