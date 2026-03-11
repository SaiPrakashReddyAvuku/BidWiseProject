"use client";

import { RoleGuard } from "@/components/auth/role-guard";
import { MiniBarChart } from "@/components/common/mini-bar-chart";
import { StatCard } from "@/components/common/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";
import { formatCurrency } from "@/utils";

export default function AdminDashboardPage() {
  const users = useBidWiseStore((state) => state.users);
  const projects = useBidWiseStore((state) => state.projects);
  const bids = useBidWiseStore((state) => state.bids);
  const revenue = bids.filter((item) => item.status === "accepted").reduce((sum, item) => sum + item.price * 0.08, 0);

  return (
    <RoleGuard role="admin">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total users" value={users.length} />
          <StatCard title="Total projects" value={projects.length} />
          <StatCard title="Total bids" value={bids.length} />
          <StatCard title="Revenue" value={formatCurrency(revenue)} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>User activity</CardTitle></CardHeader>
            <CardContent>
              <MiniBarChart
                data={[
                  { label: "Buyers", value: users.filter((item) => item.role === "buyer").length },
                  { label: "Sellers", value: users.filter((item) => item.role === "seller").length },
                  { label: "Admins", value: users.filter((item) => item.role === "admin").length }
                ]}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Bid statistics</CardTitle></CardHeader>
            <CardContent>
              <MiniBarChart
                data={[
                  { label: "Pending", value: bids.filter((item) => item.status === "pending").length },
                  { label: "Accepted", value: bids.filter((item) => item.status === "accepted").length },
                  { label: "Rejected", value: bids.filter((item) => item.status === "rejected").length }
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}


