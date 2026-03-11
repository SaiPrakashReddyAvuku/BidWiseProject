"use client";

import { useMemo } from "react";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/role-guard";
import { StatCard } from "@/components/common/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";

export default function BuyerDashboardPage() {
  const user = useBidWiseStore((state) => state.currentUser);
  const allProjects = useBidWiseStore((state) => state.projects);
  const bids = useBidWiseStore((state) => state.bids);
  const allNotifications = useBidWiseStore((state) => state.notifications);

  const projects = useMemo(
    () => allProjects.filter((project) => project.buyerId === user?.id),
    [allProjects, user?.id]
  );
  const notifications = useMemo(
    () => allNotifications.filter((item) => item.userId === user?.id),
    [allNotifications, user?.id]
  );
  const buyerBids = useMemo(() => {
    const projectIds = new Set(projects.map((project) => project.id));
    return bids.filter((bid) => projectIds.has(bid.projectId));
  }, [bids, projects]);

  return (
    <RoleGuard role="buyer">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Total projects" value={projects.length} />
          <StatCard title="Active bids" value={buyerBids.filter((item) => item.status === "pending").length} />
          <StatCard title="Completed projects" value={projects.filter((item) => item.status === "completed").length} />
        </div>

        <Card>
          <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {notifications.slice(0, 5).map((item) => (
              <p key={item.id}>- {item.message}</p>
            ))}
            <Link href="/notifications" className="text-primary">View all notifications</Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Active projects</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {projects.filter((item) => item.status !== "completed").map((project) => (
              <Link key={project.id} href={`/buyer/projects/${project.id}`} className="block rounded-md border p-3 hover:bg-muted">
                <p className="font-medium">{project.title}</p>
                <p className="text-sm text-muted-foreground">{project.category}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
