"use client";

import { ChatWindow } from "@/components/chat/chat-window";

export default function MessagesPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Messaging</h1>
      <p className="text-sm text-muted-foreground">Real-time style chat UI with message history and attachment placeholder.</p>
      <ChatWindow />
    </div>
  );
}


