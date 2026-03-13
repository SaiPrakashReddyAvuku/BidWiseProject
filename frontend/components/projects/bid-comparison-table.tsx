"use client";

import { useMemo, useState } from "react";
import { Bid, Project, User } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/utils";
import {
  getBidRecommendationScore,
  getSellerCompletedProjects,
  inferSellerLocation
} from "@/utils/buyer-insights";

type SortMode = "lowest" | "rating" | "delivery";

type ComparisonRow = {
  bid: Bid;
  seller: User | undefined;
  rating: number;
  completedProjects: number;
  location: string;
  recommendationScore: number;
};

export function BidComparisonTable({
  project,
  bids,
  sellers,
  allBids,
  onAccept,
  onReject
}: {
  project: Project;
  bids: Bid[];
  sellers: User[];
  allBids: Bid[];
  onAccept?: (bidId: string) => Promise<void> | void;
  onReject?: (bidId: string) => Promise<void> | void;
}) {
  const [sortMode, setSortMode] = useState<SortMode>("lowest");
  const [activeSeller, setActiveSeller] = useState<User | null>(null);
  const [pendingAction, setPendingAction] = useState<string>("");

  const rows = useMemo(() => {
    const mapped: ComparisonRow[] = bids.map((bid) => {
      const seller = sellers.find((item) => item.id === bid.sellerId);
      const completedProjects = getSellerCompletedProjects(allBids, bid.sellerId);
      const location = inferSellerLocation(seller);
      const recommendationScore = getBidRecommendationScore({
        bid,
        bidsForProject: bids,
        allBids,
        seller,
        project
      });

      return {
        bid,
        seller,
        rating: seller?.rating ?? 0,
        completedProjects,
        location,
        recommendationScore
      };
    });

    return mapped.sort((a, b) => {
      if (sortMode === "rating") {
        return b.rating - a.rating;
      }
      if (sortMode === "delivery") {
        return a.bid.deliveryDays - b.bid.deliveryDays;
      }
      return a.bid.price - b.bid.price;
    });
  }, [allBids, bids, project, sellers, sortMode]);

  const bestValueBidId = rows
    .slice()
    .sort((a, b) => b.recommendationScore - a.recommendationScore || a.bid.price - b.bid.price)[0]?.bid.id;

  const runAction = async (action: "accept" | "reject", bidId: string) => {
    setPendingAction(`${action}-${bidId}`);
    try {
      if (action === "accept") {
        await onAccept?.(bidId);
      } else {
        await onReject?.(bidId);
      }
    } finally {
      setPendingAction("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant={sortMode === "lowest" ? "default" : "outline"} size="sm" onClick={() => setSortMode("lowest")}>
          Sort by lowest bid
        </Button>
        <Button variant={sortMode === "rating" ? "default" : "outline"} size="sm" onClick={() => setSortMode("rating")}>
          Sort by highest rating
        </Button>
        <Button variant={sortMode === "delivery" ? "default" : "outline"} size="sm" onClick={() => setSortMode("delivery")}>
          Sort by fastest delivery
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bidder Name</TableHead>
            <TableHead>Bid Amount</TableHead>
            <TableHead>Estimated Delivery</TableHead>
            <TableHead>Seller Rating</TableHead>
            <TableHead>Past Completed Projects</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Recommended Score</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const isBestValue = row.bid.id === bestValueBidId;
            const rowActionPending = pendingAction.endsWith(row.bid.id);

            return (
              <TableRow key={row.bid.id} className={isBestValue ? "bg-emerald-500/10" : ""}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{row.seller?.name ?? "Unknown Seller"}</span>
                    {isBestValue ? <Badge variant="success">Best Value Bid</Badge> : null}
                  </div>
                </TableCell>
                <TableCell className="font-semibold">{formatCurrency(row.bid.price)}</TableCell>
                <TableCell>{row.bid.deliveryDays} days</TableCell>
                <TableCell>{row.rating ? `${row.rating.toFixed(1)}/5` : "-"}</TableCell>
                <TableCell>{row.completedProjects}</TableCell>
                <TableCell>{row.location}</TableCell>
                <TableCell>
                  <Badge variant={row.recommendationScore >= 80 ? "success" : row.recommendationScore >= 65 ? "secondary" : "default"}>
                    {row.recommendationScore}/100
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => void runAction("accept", row.bid.id)}
                      disabled={row.bid.status !== "pending" || rowActionPending}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void runAction("reject", row.bid.id)}
                      disabled={row.bid.status !== "pending" || rowActionPending}
                    >
                      Reject
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setActiveSeller(row.seller ?? null)}>
                      View Profile
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Modal
        open={Boolean(activeSeller)}
        title={activeSeller?.name ?? "Seller Profile"}
        description="Seller profile snapshot"
        onClose={() => setActiveSeller(null)}
      >
        <div className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Company:</span> {activeSeller?.companyName || "Independent"}</p>
          <p><span className="text-muted-foreground">Rating:</span> {activeSeller?.rating ? `${activeSeller.rating.toFixed(1)}/5` : "-"}</p>
          <p><span className="text-muted-foreground">Location:</span> {inferSellerLocation(activeSeller ?? undefined)}</p>
          <p><span className="text-muted-foreground">Skills:</span> {activeSeller?.skills?.join(", ") || "General delivery"}</p>
          <p><span className="text-muted-foreground">Email:</span> {activeSeller?.email || "-"}</p>
        </div>
      </Modal>
    </div>
  );
}
