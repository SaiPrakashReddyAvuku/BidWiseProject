"use client";

import { useMemo } from "react";
import { RoleGuard } from "@/components/auth/role-guard";
import { BarChart, DonutChart, LineTrendChart } from "@/components/common/simple-charts";
import { StatCard } from "@/components/common/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";
import { formatCurrency } from "@/utils";
import {
  getBiddingTrend,
  getBudgetRangeDistribution,
  getBuyerKpi,
  getCategoryDistribution,
  getMonthlySpendingData
} from "@/utils/buyer-insights";

export default function BuyerAnalyticsPage() {
  const projects = useBidWiseStore((state) => state.projects);
  const bids = useBidWiseStore((state) => state.bids);

  const kpi = useMemo(() => getBuyerKpi(projects, bids), [bids, projects]);
  const monthlySpending = useMemo(() => getMonthlySpendingData(projects, bids), [bids, projects]);
  const categoryDistribution = useMemo(() => getCategoryDistribution(projects), [projects]);
  const budgetDistribution = useMemo(() => getBudgetRangeDistribution(projects), [projects]);
  const biddingTrend = useMemo(() => getBiddingTrend(bids), [bids]);

  return (
    <RoleGuard role="buyer">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-5">
          <StatCard title="Total Projects Created" value={kpi.totalProjects} />
          <StatCard title="Total Money Spent" value={formatCurrency(kpi.totalMoneySpent)} />
          <StatCard title="Average Bid Received" value={formatCurrency(kpi.averageBidReceived)} />
          <StatCard title="Completed Projects" value={kpi.completedProjects} />
          <StatCard title="Successful Projects" value={`${kpi.successfulProjectsPercentage}%`} />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Monthly Spending Chart</CardTitle></CardHeader>
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

          <Card>
            <CardHeader><CardTitle>Budget Range vs Number of Projects</CardTitle></CardHeader>
            <CardContent>
              <BarChart data={budgetDistribution} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Bidding Activity Trend</CardTitle></CardHeader>
            <CardContent>
              <LineTrendChart data={biddingTrend} />
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}

