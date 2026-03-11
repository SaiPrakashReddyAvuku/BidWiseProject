"use client";

import { RoleGuard } from "@/components/auth/role-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";

export default function AdminDisputesPage() {
  const disputes = useBidWiseStore((state) => state.disputes);
  const resolveDispute = useBidWiseStore((state) => state.resolveDispute);

  return (
    <RoleGuard role="admin">
      <Card>
        <CardHeader><CardTitle>Dispute Management</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {disputes.map((dispute) => (
            <div key={dispute.id} className="rounded-md border p-3">
              <div className="mb-1 flex items-center justify-between">
                <p className="font-semibold">Project: {dispute.projectId}</p>
                <Badge variant={dispute.status === "resolved" ? "success" : "danger"}>{dispute.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{dispute.reason}</p>
              {dispute.status === "open" ? <Button className="mt-2" size="sm" onClick={() => resolveDispute(dispute.id)}>Resolve</Button> : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </RoleGuard>
  );
}


