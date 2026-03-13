"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLiveClock } from "@/hooks/use-live-clock";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";
import { formatDate } from "@/utils";
import { getTimeRemaining } from "@/utils/buyer-insights";

export default function NotificationsPage() {
  const currentUser = useBidWiseStore((state) => state.currentUser);
  const projects = useBidWiseStore((state) => state.projects);
  const allNotifications = useBidWiseStore((state) => state.notifications);
  const markRead = useBidWiseStore((state) => state.markNotificationRead);
  const nowMs = useLiveClock(1000);

  const synthetic = useMemo(() => {
    if (!currentUser || currentUser.role !== "buyer") {
      return [];
    }

    return [
      ...projects
        .filter((project) => {
          const countdown = getTimeRemaining(project.deadline, nowMs);
          return !countdown.isClosed && countdown.totalMs <= 24 * 60 * 60 * 1000;
        })
        .map((project) => ({
          id: `about-to-end-${project.id}`,
          userId: project.buyerId,
          title: "Project about to end",
          message: `${project.title} is entering its final 24 hours.`,
          type: "project" as const,
          isRead: false,
          createdAt: project.deadline,
          synthetic: true
        })),
      ...projects
        .filter((project) => project.status === "completed")
        .map((project) => ({
          id: `project-completed-${project.id}`,
          userId: project.buyerId,
          title: "Project completed",
          message: `${project.title} has been completed.`,
          type: "project" as const,
          isRead: false,
          createdAt: project.createdAt,
          synthetic: true
        }))
    ];
  }, [currentUser, nowMs, projects]);

  const notifications = useMemo(
    () =>
      [...allNotifications.map((item) => ({ ...item, synthetic: false })), ...synthetic]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [allNotifications, synthetic]
  );

  const grouped = useMemo(
    () => ({
      newBids: notifications.filter((item) => item.type === "bid"),
      bidsWithdrawn: notifications.filter((item) => /withdraw/i.test(item.message) || /withdraw/i.test(item.title)),
      projectAlerts: notifications.filter((item) => item.type === "project"),
      sellerMessages: notifications.filter((item) => item.type === "message")
    }),
    [notifications]
  );

  const sections = [
    { key: "newBids", title: "New bid received", items: grouped.newBids },
    { key: "bidsWithdrawn", title: "Bid withdrawn", items: grouped.bidsWithdrawn },
    { key: "projectAlerts", title: "Project alerts", items: grouped.projectAlerts },
    { key: "sellerMessages", title: "Seller message", items: grouped.sellerMessages }
  ];

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <Card key={section.key}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{section.title}</CardTitle>
              <Badge variant="secondary">{section.items.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {section.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No {section.title.toLowerCase()} notifications.</p>
            ) : (
              section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (!item.synthetic) {
                      void markRead(item.id);
                    }
                  }}
                  className={`w-full rounded-xl border border-white/25 p-3 text-left backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${item.isRead || item.synthetic ? "bg-white/35 dark:bg-slate-900/35" : "bg-sky-200/35 dark:bg-sky-900/25"}`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <p className="font-semibold">{item.title}</p>
                    {item.synthetic ? <Badge variant="secondary">Auto</Badge> : null}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.message}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
                </button>
              ))
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
