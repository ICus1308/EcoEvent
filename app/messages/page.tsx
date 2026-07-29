"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Send, MapPin, MoreVertical, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { SlideUp, staggerContainerVariants, staggerItemVariants } from "@/components/ui/animations";

const CONVERSATIONS = [
  {
    id: 1,
    name: "Câu lạc bộ Green Campus",
    avatar: "GC",
    lastMessage: "Vâng, bạn có thể đến lấy bộ đồ ăn bằng tre vào 9 giờ sáng mai.",
    time: "10:42 AM",
    unread: 2,
    item: "Bộ đồ ăn bằng tre"
  },
  {
    id: 2,
    name: "Minh Tran",
    avatar: "MT",
    lastMessage: "Cảm ơn bạn đã thuê máy ảnh! Tiền cọc đã được hoàn trả.",
    time: "Hôm qua",
    unread: 0,
    item: "Máy ảnh chuyên nghiệp Sony A7III"
  },
  {
    id: 3,
    name: "RMIT Event Dept",
    avatar: "RE",
    lastMessage: "Bộ đàm đã được sạc đầy chưa?",
    time: "Thứ ba",
    unread: 0,
    item: "Bộ đàm (Bộ 6 cái)"
  }
];

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState(CONVERSATIONS[0]);

  return (
    <div className="container mx-auto p-4 md:p-8 h-[calc(100vh-80px)] max-h-[900px]">
      <SlideUp className="h-full">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full gap-6 bg-card border rounded-2xl overflow-hidden shadow-sm">
          
          {/* Sidebar - Conversation List */}
          <div className="border-r flex flex-col h-full bg-muted/20">
            <div className="p-4 border-b bg-background">
              <h1 className="text-xl font-bold mb-4">Tin nhắn</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Tìm kiếm tin nhắn..." className="pl-9 bg-muted" />
              </div>
            </div>
            
            <motion.div 
              variants={staggerContainerVariants}
              initial="hidden"
              animate="show"
              className="overflow-y-auto flex-grow"
            >
              {CONVERSATIONS.map(chat => (
                <motion.div 
                  key={chat.id}
                  variants={staggerItemVariants}
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.03)" }}
                  onClick={() => setActiveChat(chat)}
                  className={`p-4 border-b cursor-pointer transition-colors ${activeChat.id === chat.id ? 'bg-green-50 dark:bg-green-950/30 border-l-4 border-l-green-600' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center font-bold text-green-800 dark:text-green-200 flex-shrink-0">
                        {chat.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{chat.name}</h3>
                        <p className="text-xs text-muted-foreground">{chat.item}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{chat.time}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pl-13">
                    <p className="text-sm text-muted-foreground line-clamp-1 pr-4">{chat.lastMessage}</p>
                    {chat.unread > 0 && (
                      <Badge className="bg-green-600 h-5 w-5 p-0 flex items-center justify-center rounded-full flex-shrink-0">
                        {chat.unread}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2 flex flex-col h-full bg-background">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeChat.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex flex-col h-full"
              >
                {/* Chat Header */}
                <div className="p-4 border-b flex justify-between items-center bg-card">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center font-bold text-green-800 dark:text-green-200">
                      {activeChat.avatar}
                    </div>
                    <div>
                      <h2 className="font-bold">{activeChat.name}</h2>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span> Trực tuyến
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon"><Phone className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                  </div>
                </div>
                
                {/* Chat Context Banner */}
                <div className="p-3 bg-muted/50 border-b flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Yêu cầu thuê:</span>
                    <span className="text-muted-foreground">{activeChat.item}</span>
                  </div>
                  <Button variant="link" className="h-auto p-0 text-green-600">Xem bài đăng</Button>
                </div>

                {/* Messages Wrapper */}
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                  <div className="flex justify-center mb-4">
                    <Badge variant="outline" className="bg-muted text-xs font-normal">Hôm nay</Badge>
                  </div>
                  
                  {/* Mock messages */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col gap-1 max-w-[80%] items-end ml-auto">
                    <div className="bg-green-600 text-white p-3 rounded-2xl rounded-tr-sm shadow-sm">
                      Chào bạn! Mình vừa đặt bộ đồ ăn cho sự kiện tuần tới. Cho mình hỏi chính xác địa điểm nhận đồ trong trường là ở đâu?
                    </div>
                    <span className="text-xs text-muted-foreground mr-1">10:30 AM</span>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col gap-1 max-w-[80%] items-start mr-auto">
                    <div className="bg-muted p-3 rounded-2xl rounded-tl-sm text-foreground shadow-sm">
                      Chào bạn! Cảm ơn bạn đã đặt. Chúng mình ở phòng 204, tòa nhà Hội Sinh viên.
                    </div>
                    <span className="text-xs text-muted-foreground ml-1">10:35 AM</span>
                  </motion.div>
                  
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col gap-1 max-w-[80%] items-start mr-auto">
                    <div className="bg-muted p-3 rounded-2xl rounded-tl-sm text-foreground shadow-sm">
                      Vâng, bạn có thể lấy bộ đồ ăn bằng tre vào 9 giờ sáng mai. Hãy cho mình biết nếu bạn cần giúp mang ra xe nhé!
                    </div>
                    <span className="text-xs text-muted-foreground ml-1">10:42 AM</span>
                  </motion.div>
                </div>

                {/* Input Area */}
                <div className="p-4 border-t bg-card">
                  <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                    <Button variant="outline" type="button" size="icon" className="flex-shrink-0 rounded-full">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Input 
                      placeholder="Nhập tin nhắn của bạn..." 
                      className="rounded-full bg-muted border-none focus-visible:ring-1 focus-visible:ring-green-600" 
                    />
                    <Button type="submit" size="icon" className="bg-green-600 hover:bg-green-700 rounded-full flex-shrink-0 shadow-md">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </SlideUp>
    </div>
  );
}
