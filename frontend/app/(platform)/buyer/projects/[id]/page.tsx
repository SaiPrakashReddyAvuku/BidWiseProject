"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import { BidTable } from "@/components/projects/bid-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";
import { formatCurrency, formatDate } from "@/utils";

export default function BuyerProjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const projects = useBidWiseStore((state) => state.projects);
  const allBids = useBidWiseStore((state) => state.bids);
  const users = useBidWiseStore((state) => state.users);
  const acceptBid = useBidWiseStore((state) => state.acceptBid);
  const rejectBid = useBidWiseStore((state) => state.rejectBid);

  const project = useMemo(
    () => projects.find((item) => item.id === id),
    [projects, id]
  );
  const bids = useMemo(
    () => allBids.filter((bid) => bid.projectId === id),
    [allBids, id]
  );

  if (!project) return <RoleGuard role="buyer"><p>Project not found.</p></RoleGuard>;

  const lowestBid = bids.slice().sort((a, b) => a.price - b.price)[0];

  return (
    <RoleGuard role="buyer">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{project.title}</CardTitle>
              <Badge variant={project.status === "open" ? "success" : "secondary"}>{project.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>{project.description}</p>
            <p>Budget: {formatCurrency(project.budget)}</p>
            <p>Deadline: {formatDate(project.deadline)}</p>
            <p>Attachments: {project.attachments.join(", ") || "None"}</p>
            <div className="flex gap-2">
              <Button variant="outline">Message vendor</Button>
              <Link href="/buyer/bids/compare" className="text-primary">Open comparison table</Link>
              {lowestBid ? <Link href={`/contracts/${lowestBid.id}`} className="text-primary">View contract</Link> : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Bids and bid history</CardTitle></CardHeader>
          <CardContent>
            <BidTable
              bids={bids}
              sellers={users}
              lowestBidId={lowestBid?.id}
              canManage
              onAccept={(bidId) => void acceptBid(bidId)}
              onReject={(bidId) => void rejectBid(bidId)}
              allBids={allBids}
            />
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
