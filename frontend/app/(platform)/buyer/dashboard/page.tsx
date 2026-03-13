"use client";

import Link from "next/link";
import { useMemo } from "react";
import { RoleGuard } from "@/components/auth/role-guard";
import { BarChart, DonutChart } from "@/components/common/simple-charts";
import { StatCard } from "@/components/common/stat-card";
import { ProjectCountdownCard } from "@/components/projects/project-countdown-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLiveClock } from "@/hooks/use-live-clock";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";
import { formatCurrency, formatDate } from "@/utils";
import {
  getBuyerKpi,
  getCategoryDistribution,
  getMonthlySpendingData,
  getProjectSpecificBids,
  getRecommendedSellers,
  getTimeRemaining
} from "@/utils/buyer-insights";

export default function BuyerDashboardPage() {
  const projects = useBidWiseStore((state) => state.projects);
  const bids = useBidWiseStore((state) => state.bids);
  const users = useBidWiseStore((state) => state.users);
  const notifications = useBidWiseStore((state) => state.notifications);
  const nowMs = useLiveClock(1000);

  const kpi = useMemo(() => getBuyerKpi(projects, bids), [bids, projects]);
  const monthlySpending = useMemo(() => getMonthlySpendingData(projects, bids), [bids, projects]);
  const categoryDistribution = useMemo(() => getCategoryDistribution(projects), [projects]);

  const activeProjects = useMemo(
    () =>
      projects
        .filter((project) => project.status !== "completed")
        .map((project) => ({
          project,
          bidCount: getProjectSpecificBids(bids, project.id).length
        })),
    [bids, projects]
  );

  const recommendations = useMemo(
    () => getRecommendedSellers({ projects, bids, users }),
    [bids, projects, users]
  );

  const syntheticAlerts = useMemo(() => {
    const projectEndingSoon = projects
      .filter((project) => {
        const countdown = getTimeRemaining(project.deadline, nowMs);
        return !countdown.isClosed && countdown.totalMs <= 24 * 60 * 60 * 1000;
      })
      .map((project) => ({
        id: `ending-${project.id}`,
        title: "Project about to end",
        message: `${project.title} is closing soon.`,
        createdAt: project.deadline,
        type: "project"
      }));

    const completedProjects = projects
      .filter((project) => project.status === "completed")
      .map((project) => ({
        id: `completed-${project.id}`,
        title: "Project completed",
        message: `${project.title} has been marked completed.`,
        createdAt: project.createdAt,
        type: "project"
      }));

    return [...projectEndingSoon, ...completedProjects];
  }, [nowMs, projects]);

  const recentActivity = useMemo(
    () =>
      [...notifications.map((item) => ({ ...item, synthetic: false })), ...syntheticAlerts.map((item) => ({ ...item, synthetic: true }))]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8),
    [notifications, syntheticAlerts]
  );

  return (
    <RoleGuard role="buyer">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-5">
          <StatCard title="Total Projects Created" value={kpi.totalProjects} />
          <StatCard title="Total Money Spent" value={formatCurrency(kpi.totalMoneySpent)} />
          <StatCard title="Average Bid Received" value={formatCurrency(kpi.averageBidReceived)} />
          <StatCard title="Completed Projects" value={kpi.completedProjects} href="/buyer/projects?view=closed" subtitle="Open closed projects" />
          <StatCard title="Successful Projects" value={`${kpi.successfulProjectsPercentage}%`} />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Projects with Live Countdown</CardTitle>
              <Link href="/buyer/projects" className="text-sm text-primary">View all</Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 lg:grid-cols-2">
              {activeProjects.map((item) => (
                <ProjectCountdownCard
                  key={item.project.id}
                  project={item.project}
                  bidders={item.bidCount}
                  nowMs={nowMs}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Monthly Spending</CardTitle>
                <Link href="/buyer/analytics" className="text-sm text-primary">Open analytics</Link>
              </div>
            </CardHeader>
            <CardContent>
              <BarChart data={monthlySpending} formatter={(value) => formatCurrency(value)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Project Category Distribution</CardTitle></CardHeader>
            <CardContent>
              <DonutChart data={categoryDistribution} />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader><CardTitle>Recommended Sellers (AI)</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {recommendations.map((item) => (
                  <div key={item.seller.id} className="rounded-xl border border-white/25 bg-white/40 p-3 text-sm dark:bg-slate-900/35">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="font-semibold">{item.seller.name}</p>
                      <Badge variant={item.score >= 80 ? "success" : "secondary"}>{item.score}/100</Badge>
                    </div>
                    <p className="text-muted-foreground">{item.seller.companyName || "Independent seller"}</p>
                    <p className="text-xs text-muted-foreground">{item.reasons.join(" | ")}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {recentActivity.map((item) => (
                <div key={item.id} className="rounded-lg border border-white/20 bg-white/35 p-2 dark:bg-slate-900/35">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-muted-foreground">{item.message}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
                </div>
              ))}
              <Link href="/notifications" className="text-primary">View all notifications</Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}

