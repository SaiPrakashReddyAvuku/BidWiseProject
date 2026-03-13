"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import { BidComparisonTable } from "@/components/projects/bid-comparison-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";
import { formatCurrency } from "@/utils";

export default function ProjectBidComparisonPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = Array.isArray(params.projectId) ? params.projectId[0] : params.projectId;

  const projects = useBidWiseStore((state) => state.projects);
  const bids = useBidWiseStore((state) => state.bids);
  const users = useBidWiseStore((state) => state.users);
  const acceptBid = useBidWiseStore((state) => state.acceptBid);
  const rejectBid = useBidWiseStore((state) => state.rejectBid);

  const [error, setError] = useState("");

  const project = useMemo(() => projects.find((item) => item.id === projectId), [projectId, projects]);
  const projectBids = useMemo(() => bids.filter((item) => item.projectId === projectId), [bids, projectId]);
  const sellers = useMemo(() => users.filter((item) => item.role === "seller"), [users]);

  if (!project) {
    return (
      <RoleGuard role="buyer">
        <Card>
          <CardHeader><CardTitle>Project not found</CardTitle></CardHeader>
          <CardContent>
            <Link href="/buyer/bids/compare" className="text-primary">Back to project list</Link>
          </CardContent>
        </Card>
      </RoleGuard>
    );
  }

  const lowestBid = projectBids.length ? Math.min(...projectBids.map((bid) => bid.price)) : 0;

  const onAccept = async (bidId: string) => {
    setError("");
    try {
      await acceptBid(bidId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to accept bid");
    }
  };

  const onReject = async (bidId: string) => {
    setError("");
    try {
      await rejectBid(bidId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to reject bid");
    }
  };

  return (
    <RoleGuard role="buyer">
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>{project.title} - Bid Comparison</CardTitle>
              <Badge variant="secondary">Project-specific view</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Category:</span> {project.category}</p>
            <p><span className="text-muted-foreground">Budget:</span> {formatCurrency(project.budget)}</p>
            <p><span className="text-muted-foreground">Bids received:</span> {projectBids.length}</p>
            <p><span className="text-muted-foreground">Lowest bid:</span> {projectBids.length ? formatCurrency(lowestBid) : "No bids yet"}</p>
            <div className="flex gap-4">
              <Link href={`/buyer/projects/${project.id}`} className="text-primary">View project details</Link>
              <Link href="/buyer/bids/compare" className="text-primary">Back to project list</Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Bidders</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            <BidComparisonTable
              project={project}
              bids={projectBids}
              sellers={sellers}
              allBids={bids}
              onAccept={onAccept}
              onReject={onReject}
            />
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
