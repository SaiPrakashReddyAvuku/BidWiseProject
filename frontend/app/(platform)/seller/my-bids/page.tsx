"use client";

import { useMemo } from "react";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/role-guard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";
import { formatCurrency } from "@/utils";

export default function MyBidsPage() {
  const user = useBidWiseStore((state) => state.currentUser);
  const allBids = useBidWiseStore((state) => state.bids);
  const projects = useBidWiseStore((state) => state.projects);

  const bids = useMemo(
    () => allBids.filter((bid) => bid.sellerId === user?.id),
    [allBids, user?.id]
  );

  return (
    <RoleGuard role="seller">
      <Card>
        <CardHeader><CardTitle>My Bids</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Project</TableHead><TableHead>Bid price</TableHead><TableHead>Status</TableHead><TableHead>Result</TableHead></TableRow></TableHeader>
            <TableBody>
              {bids.map((bid) => {
                const project = projects.find((item) => item.id === bid.projectId);
                return (
                  <TableRow key={bid.id}>
                    <TableCell><Link href={`/seller/projects/${bid.projectId}`} className="text-primary">{project?.title ?? "Unknown"}</Link></TableCell>
                    <TableCell>{formatCurrency(bid.price)}</TableCell>
                    <TableCell><Badge variant={bid.status === "accepted" ? "success" : bid.status === "rejected" ? "danger" : "secondary"}>{bid.status}</Badge></TableCell>
                    <TableCell>{bid.status === "accepted" ? "Won" : bid.status === "rejected" ? "Lost" : "In review"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </RoleGuard>
  );
}
