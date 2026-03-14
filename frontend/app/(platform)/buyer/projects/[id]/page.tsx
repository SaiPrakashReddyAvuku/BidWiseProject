"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import { AttachmentList } from "@/components/projects/attachment-list";
import { BidTable } from "@/components/projects/bid-table";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/status-badges";
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
  const orders = useBidWiseStore((state) => state.orders);
  const users = useBidWiseStore((state) => state.users);
  const acceptBid = useBidWiseStore((state) => state.acceptBid);
  const rejectBid = useBidWiseStore((state) => state.rejectBid);
  const completeOrder = useBidWiseStore((state) => state.completeOrder);
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
  const order = useMemo(
    () => orders.find((item) => item.projectId === id),
    [orders, id]
  );

  if (!project) return <RoleGuard role="buyer"><p>Project not found.</p></RoleGuard>;

  const lowestBid = bids.slice().sort((a, b) => a.price - b.price)[0];
  const deliveryCompleted = order?.status === "delivered" || order?.status === "completed";
  const reviewEligibleBids = bids.filter((bid) =>
    (deliveryCompleted && bid.status === "accepted") || bid.status === "rejected"
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

  const onConfirmDelivery = async () => {
    setCompletionError("");
    try {
      if (!order) {
        throw new Error("No active order found for this project.");
      }
      await completeOrder(order.id);
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
                {order?.status === "delivered" ? (
                  <Button size="sm" onClick={() => void onConfirmDelivery()}>
                    Confirm Delivery
                  </Button>
                ) : null}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>{project.description}</p>
            <p>Budget: {formatCurrency(project.budget)}</p>
            <p>Deadline: {formatDate(project.deadline)}</p>
            {project.closureReason ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Closure reason</span>
                <Badge variant="warning">{project.closureReason}</Badge>
              </div>
            ) : null}
            <div>
              <p className="mb-1">Attachments</p>
              <AttachmentList attachments={project.attachments} />
            </div>
            {order ? (
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Order status</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Payment</span>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
              </div>
            ) : null}
            {completionError ? <p className="text-sm text-red-500">{completionError}</p> : null}
            <div className="flex gap-2">
              <Button variant="outline">Message vendor</Button>
              <Link href={`/buyer/bids/compare/${project.id}`} className="text-primary">Open comparison table</Link>
              {order ? <Link href={`/orders/${order.id}`} className="text-primary">View order</Link> : null}
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
              <p className="text-muted-foreground">Write Review appears once a bidder is rejected or the order is delivered.</p>
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

