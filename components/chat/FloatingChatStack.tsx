"use client";

import React, { useState } from "react";
import TechSupportBubble from "./TechSupportBubble";
import UserChatBubble from "./UserChatBubble";

export default function FloatingChatStack() {
  const [activeBubble, setActiveBubble] = useState<"tech" | "user" | null>(null);

  const toggleTech = () => {
    setActiveBubble((prev) => (prev === "tech" ? null : "tech"));
  };

  const toggleUser = () => {
    setActiveBubble((prev) => (prev === "user" ? null : "user"));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto">
      {/* Upper Bubble: Tech Support AI Chatbot */}
      <TechSupportBubble
        isOpen={activeBubble === "tech"}
        onToggle={toggleTech}
      />

      {/* Lower Bubble: User P2P Chat */}
      <UserChatBubble
        isOpen={activeBubble === "user"}
        onToggle={toggleUser}
      />
    </div>
  );
}
