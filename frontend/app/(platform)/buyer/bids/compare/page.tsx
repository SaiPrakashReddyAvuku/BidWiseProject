"use client";

import { useMemo } from "react";
import { RoleGuard } from "@/components/auth/role-guard";
import { BidComparisonTable } from "@/components/projects/bid-comparison-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";

export default function BuyerBidComparisonPage() {
  const user = useBidWiseStore((state) => state.currentUser);
  const allProjects = useBidWiseStore((state) => state.projects);
  const allBids = useBidWiseStore((state) => state.bids);
  const users = useBidWiseStore((state) => state.users);

  const projects = useMemo(
    () => allProjects.filter((item) => item.buyerId === user?.id),
    [allProjects, user?.id]
  );
  const bids = useMemo(() => {
    const projectIds = new Set(projects.map((project) => project.id));
    return allBids.filter((bid) => projectIds.has(bid.projectId));
  }, [allBids, projects]);
  const sellers = useMemo(
    () => users.filter((item) => item.role === "seller"),
    [users]
  );

  return (
    <RoleGuard role="buyer">
      <Card>
        <CardHeader><CardTitle>Bid Comparison</CardTitle></CardHeader>
        <CardContent>
          <BidComparisonTable bids={bids} sellers={sellers} allBids={allBids} />
        </CardContent>
      </Card>
    </RoleGuard>
  );
}
