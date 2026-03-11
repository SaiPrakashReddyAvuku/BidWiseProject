"use client";

import { useMemo, useState } from "react";
import { HoverPreview } from "@/components/common/hover-preview";
import { Bid, User } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils";

export function BidComparisonTable({ bids, sellers, allBids }: { bids: Bid[]; sellers: User[]; allBids?: Bid[] }) {
  const [asc, setAsc] = useState(true);
  const statsSource = allBids ?? bids;

  const rows = useMemo(() => {
    const merged = bids.map((bid) => ({
      ...bid,
      vendor: sellers.find((seller) => seller.id === bid.sellerId)
    }));
    return merged.sort((a, b) => (asc ? a.price - b.price : b.price - a.price));
  }, [asc, bids, sellers]);

  return (
    <div className="space-y-3">
      <Button variant="outline" onClick={() => setAsc((prev) => !prev)}>Sort by lowest bid {asc ? "(asc)" : "(desc)"}</Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vendor</TableHead>
            <TableHead>Bid Price</TableHead>
            <TableHead>Delivery</TableHead>
            <TableHead>Rating</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => {
            const vendorBids = statsSource.filter((item) => item.sellerId === row.sellerId);
            const completedProjects = vendorBids.filter((item) => item.status === "accepted").length;
            const avgDelivery = vendorBids.length
              ? Math.round(vendorBids.reduce((sum, item) => sum + item.deliveryDays, 0) / vendorBids.length)
              : row.deliveryDays;

            return (
              <TableRow key={row.id} className={index === 0 ? "bg-emerald-500/10" : ""}>
                <TableCell>
                  <HoverPreview trigger={<span className="font-medium">{row.vendor?.name ?? "Unknown"}</span>}>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">{row.vendor?.name ?? "Unknown Vendor"}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <p><span className="text-muted-foreground">Rating:</span> {row.vendor?.rating ?? "-"}</p>
                        <p><span className="text-muted-foreground">Completed:</span> {completedProjects}</p>
                        <p><span className="text-muted-foreground">Avg delivery:</span> {avgDelivery} days</p>
                        <p><span className="text-muted-foreground">Tags:</span> {row.vendor?.skills?.slice(0, 2).join(", ") || "General"}</p>
                      </div>
                    </div>
                  </HoverPreview>
                </TableCell>
                <TableCell className="font-semibold">
                  <HoverPreview
                    trigger={<span>{formatCurrency(row.price)}</span>}
                    previewClassName="w-64"
                  >
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Bid Preview</p>
                      <p><span className="text-muted-foreground">Vendor:</span> {row.vendor?.name ?? "Unknown"}</p>
                      <p><span className="text-muted-foreground">Bid amount:</span> {formatCurrency(row.price)}</p>
                      <p><span className="text-muted-foreground">Delivery:</span> {row.deliveryDays} days</p>
                      <p><span className="text-muted-foreground">Vendor rating:</span> {row.vendor?.rating ?? "-"}</p>
                    </div>
                  </HoverPreview>
                </TableCell>
                <TableCell>{row.deliveryDays} days</TableCell>
                <TableCell>{row.vendor?.rating ?? "-"}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
