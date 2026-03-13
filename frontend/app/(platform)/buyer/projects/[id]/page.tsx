"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import { AttachmentList } from "@/components/projects/attachment-list";
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
  const completeProject = useBidWiseStore((state) => state.completeProject);
  const [actionError, setActionError] = useState("");
  const [completionError, setCompletionError] = useState("");

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
  const reviewEligibleBids = bids.filter((bid) =>
    (project.status === "completed" && bid.status === "accepted") || bid.status === "rejected"
  );

  const onAccept = async (bidId: string) => {
    setActionError("");
    try {
      await acceptBid(bidId);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to accept bid.");
    }
  };

  const onReject = async (bidId: string) => {
    setActionError("");
    try {
      await rejectBid(bidId);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to reject bid.");
    }
  };

  const onCompleteProject = async () => {
    setCompletionError("");
    try {
      await completeProject(project.id);
    } catch (error) {
      setCompletionError(error instanceof Error ? error.message : "Failed to complete project.");
    }
  };

  return (
    <RoleGuard role="buyer">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>{project.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={project.status === "open" ? "success" : "secondary"}>{project.status}</Badge>
                {project.status === "in_progress" ? (
                  <Button size="sm" onClick={() => void onCompleteProject()}>
                    Mark as Completed
                  </Button>
                ) : null}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>{project.description}</p>
            <p>Budget: {formatCurrency(project.budget)}</p>
            <p>Deadline: {formatDate(project.deadline)}</p>
            <div>
              <p className="mb-1">Attachments</p>
              <AttachmentList attachments={project.attachments} />
            </div>
            {completionError ? <p className="text-sm text-red-500">{completionError}</p> : null}
            <div className="flex gap-2">
              <Button variant="outline">Message vendor</Button>
              <Link href={`/buyer/bids/compare/${project.id}`} className="text-primary">Open comparison table</Link>
              {lowestBid ? <Link href={`/contracts/${lowestBid.id}`} className="text-primary">View contract</Link> : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Bids and bid history</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {actionError ? <p className="text-sm text-red-500">{actionError}</p> : null}
            <BidTable
              bids={bids}
              sellers={users}
              lowestBidId={lowestBid?.id}
              canManage
              onAccept={(bidId) => void onAccept(bidId)}
              onReject={(bidId) => void onReject(bidId)}
              allBids={allBids}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Review Eligibility</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {reviewEligibleBids.length === 0 ? (
              <p className="text-muted-foreground">Write Review appears once a bidder is rejected or a delivered project is completed.</p>
            ) : (
              reviewEligibleBids.map((bid) => {
                const seller = users.find((user) => user.id === bid.sellerId);
                return (
                  <div key={bid.id} className="flex items-center justify-between rounded-lg border border-white/20 bg-white/35 p-2 dark:bg-slate-900/35">
                    <p>{seller?.name ?? "Seller"} ({bid.status})</p>
                    <Link href={`/reviews?projectId=${project.id}&sellerId=${bid.sellerId}&bidId=${bid.id}`} className="text-primary">
                      Write Review
                    </Link>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}

