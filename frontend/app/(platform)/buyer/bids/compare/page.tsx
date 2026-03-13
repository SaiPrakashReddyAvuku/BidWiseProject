"use client";

import Link from "next/link";
import { useMemo } from "react";
import { RoleGuard } from "@/components/auth/role-guard";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLiveClock } from "@/hooks/use-live-clock";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";
import { formatCurrency } from "@/utils";
import { getProjectSpecificBids, getTimeRemaining } from "@/utils/buyer-insights";

export default function BuyerBidComparisonProjectsPage() {
  const projects = useBidWiseStore((state) => state.projects);
  const allBids = useBidWiseStore((state) => state.bids);
  const nowMs = useLiveClock(1000);

  const rows = useMemo(
    () =>
      projects.map((project) => {
        const bids = getProjectSpecificBids(allBids, project.id);
        const lowestBid = bids.length ? Math.min(...bids.map((bid) => bid.price)) : 0;
        const time = getTimeRemaining(project.deadline, nowMs);

        return {
          project,
          bidCount: bids.length,
          lowestBid,
          time
        };
      }),
    [allBids, nowMs, projects]
  );

  return (
    <RoleGuard role="buyer">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Bid Comparison by Project</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Select a project to open its dedicated bid comparison table. Bids are strictly separated project-by-project.
          </CardContent>
        </Card>

        {rows.length === 0 ? (
          <EmptyState title="No projects yet" description="Create a project first, then compare incoming bids here." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {rows.map(({ project, bidCount, lowestBid, time }) => (
              <Card key={project.id} className="glass-hover">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-base">{project.title}</CardTitle>
                    <Badge variant={time.isClosed ? "danger" : "success"}>{time.isClosed ? "Bidding Closed" : "Open"}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p><span className="text-muted-foreground">Category:</span> {project.category}</p>
                  <p><span className="text-muted-foreground">Bidder count:</span> {bidCount}</p>
                  <p><span className="text-muted-foreground">Lowest bid:</span> {bidCount ? formatCurrency(lowestBid) : "No bids yet"}</p>
                  <p className="rounded-lg border border-white/25 bg-white/40 px-3 py-2 text-xs dark:bg-slate-900/35">{time.label}</p>
                  <div className="flex items-center justify-between">
                    <Link href={`/buyer/projects/${project.id}`} className="text-primary">View project</Link>
                    <Link href={`/buyer/bids/compare/${project.id}`} className="text-primary">Open Bid Comparison</Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
