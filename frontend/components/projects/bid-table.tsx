import { HoverPreview } from "@/components/common/hover-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bid, User } from "@/types";
import { formatCurrency, formatDate } from "@/utils";

export function BidTable({
  bids,
  sellers,
  lowestBidId,
  onAccept,
  onReject,
  canManage,
  allBids
}: {
  bids: Bid[];
  sellers: User[];
  lowestBidId?: string;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  canManage?: boolean;
  allBids?: Bid[];
}) {
  const statsSource = allBids ?? bids;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vendor</TableHead>
          <TableHead>Bid Price</TableHead>
          <TableHead>Delivery</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          {canManage ? <TableHead>Actions</TableHead> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {bids.map((bid) => {
          const seller = sellers.find((user) => user.id === bid.sellerId);
          const isLowest = bid.id === lowestBidId;
          const vendorBids = statsSource.filter((item) => item.sellerId === bid.sellerId);
          const avgDelivery = vendorBids.length
            ? Math.round(vendorBids.reduce((sum, item) => sum + item.deliveryDays, 0) / vendorBids.length)
            : bid.deliveryDays;
          const completedProjects = vendorBids.filter((item) => item.status === "accepted").length;

          return (
            <TableRow key={bid.id} className={isLowest ? "bg-emerald-500/10" : ""}>
              <TableCell>
                <HoverPreview
                  trigger={<span className="cursor-default font-medium">{seller?.name ?? "Unknown"}</span>}
                >
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">{seller?.name ?? "Unknown Vendor"}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <p><span className="text-muted-foreground">Rating:</span> {seller?.rating ?? "-"}</p>
                      <p><span className="text-muted-foreground">Completed:</span> {completedProjects}</p>
                      <p><span className="text-muted-foreground">Avg delivery:</span> {avgDelivery} days</p>
                      <p><span className="text-muted-foreground">Tags:</span> {seller?.skills?.slice(0, 2).join(", ") || "General"}</p>
                    </div>
                  </div>
                </HoverPreview>
              </TableCell>
              <TableCell className="font-semibold">
                <HoverPreview
                  trigger={<span>{formatCurrency(bid.price)}</span>}
                  previewClassName="w-64"
                >
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Bid Preview</p>
                    <p><span className="text-muted-foreground">Vendor:</span> {seller?.name ?? "Unknown"}</p>
                    <p><span className="text-muted-foreground">Bid amount:</span> {formatCurrency(bid.price)}</p>
                    <p><span className="text-muted-foreground">Delivery:</span> {bid.deliveryDays} days</p>
                    <p><span className="text-muted-foreground">Vendor rating:</span> {seller?.rating ?? "-"}</p>
                  </div>
                </HoverPreview>
                {isLowest ? <Badge variant="success" className="ml-2">Lowest</Badge> : null}
              </TableCell>
              <TableCell>{bid.deliveryDays} days</TableCell>
              <TableCell>
                <Badge variant={bid.status === "accepted" ? "success" : bid.status === "rejected" ? "danger" : "secondary"}>{bid.status}</Badge>
              </TableCell>
              <TableCell>{formatDate(bid.createdAt)}</TableCell>
              {canManage ? (
                <TableCell className="space-x-2">
                  <Button size="sm" onClick={() => onAccept?.(bid.id)} disabled={bid.status === "accepted"}>Accept</Button>
                  <Button size="sm" variant="outline" onClick={() => onReject?.(bid.id)} disabled={bid.status !== "pending"}>Reject</Button>
                </TableCell>
              ) : null}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
