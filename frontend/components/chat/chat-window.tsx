"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";

export function ChatWindow() {
  const user = useBidWiseStore((state) => state.currentUser);
  const users = useBidWiseStore((state) => state.users);
  const messages = useBidWiseStore((state) => state.messages);
  const allNotifications = useBidWiseStore((state) => state.notifications);
  const sendMessage = useBidWiseStore((state) => state.sendMessage);
  const refreshConversation = useBidWiseStore((state) => state.refreshConversation);
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState("");

  const notifications = useMemo(
    () =>
      allNotifications.filter(
        (item) => item.userId === user?.id && item.type === "message" && !item.isRead
      ),
    [allNotifications, user?.id]
  );

  const peers = users.filter((item) => item.id !== user?.id && item.role !== "admin");
  const [peerId, setPeerId] = useState("");
  const activePeerId = peerId || peers[0]?.id || "";

  useEffect(() => {
    if (activePeerId) {
      void refreshConversation(activePeerId);
    }
  }, [activePeerId, refreshConversation]);

  const history = !user || !activePeerId
    ? []
    : messages
        .filter(
          (item) =>
            (item.fromUserId === user.id && item.toUserId === activePeerId) ||
            (item.fromUserId === activePeerId && item.toUserId === user.id)
        )
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const peerHasNewMessage = (id: string) => {
    if (!user) return false;
    const last = messages
      .filter(
        (item) =>
          (item.fromUserId === user.id && item.toUserId === id) ||
          (item.fromUserId === id && item.toUserId === user.id)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .at(-1);

    return Boolean(last && last.fromUserId === id);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim() || !activePeerId) return;
    await sendMessage(activePeerId, message, attachment || undefined);
    setMessage("");
    setAttachment("");
  };

  const onFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const fileName = event.target.files?.[0]?.name ?? "";
    setAttachment(fileName);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <div className="glass-panel rounded-xl p-3">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Conversations</h3>
          <Badge variant="secondary">{notifications.length} new</Badge>
        </div>
        <div className="space-y-2">
          {peers.map((peer) => (
            <button
              key={peer.id}
              onClick={() => setPeerId(peer.id)}
              className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition ${activePeerId === peer.id ? "bg-primary text-white shadow" : "bg-white/45 hover:bg-white/65 dark:bg-slate-800/45 dark:hover:bg-slate-800/65"}`}
            >
              <span>{peer.name}</span>
              {peerHasNewMessage(peer.id) ? <span className="h-2 w-2 rounded-full bg-emerald-500" /> : null}
            </button>
          ))}
        </div>
      </div>
      <div className="glass-panel rounded-xl p-4">
        <div className="mb-3 h-80 space-y-2 overflow-y-auto rounded-xl border border-white/25 bg-white/40 p-3 dark:bg-slate-900/40">
          {history.map((item) => (
            <div
              key={item.id}
              className={`max-w-[80%] rounded-lg p-2 text-sm ${item.fromUserId === user?.id ? "ml-auto bg-primary text-white" : "bg-muted"}`}
            >
              <p>{item.content}</p>
              {item.attachment ? <p className="mt-1 text-xs opacity-80">Attachment: {item.attachment}</p> : null}
            </div>
          ))}
        </div>
        <form onSubmit={onSubmit} className="space-y-2">
          <div className="flex gap-2">
            <Input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Type your message" />
            <Button type="submit">Send</Button>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <Paperclip className="h-4 w-4" />
            Attach file
            <input type="file" className="hidden" onChange={onFileSelect} />
            {attachment ? <span className="truncate">{attachment}</span> : null}
          </label>
        </form>
      </div>
    </div>
  );
}
