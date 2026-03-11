"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";
import { formatDate } from "@/utils";

export default function NotificationsPage() {
  const user = useBidWiseStore((state) => state.currentUser);
  const allNotifications = useBidWiseStore((state) => state.notifications);
  const markRead = useBidWiseStore((state) => state.markNotificationRead);

  const notifications = useMemo(
    () => allNotifications.filter((item) => item.userId === user?.id),
    [allNotifications, user?.id]
  );

  return (
    <Card>
      <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {notifications.map((item) => (
          <button
            key={item.id}
            onClick={() => markRead(item.id)}
            className={`w-full rounded-xl border border-white/25 p-3 text-left backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${item.isRead ? "bg-white/35 dark:bg-slate-900/35" : "bg-sky-200/35 dark:bg-sky-900/25"}`}
          >
            <p className="font-semibold">{item.title}</p>
            <p className="text-sm text-muted-foreground">{item.message}</p>
            <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
