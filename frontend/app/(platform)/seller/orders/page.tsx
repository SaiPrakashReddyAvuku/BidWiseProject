"use client";

import { RoleGuard } from "@/components/auth/role-guard";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingState } from "@/components/common/loading-state";
import { OrderTable } from "@/components/orders/order-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";

export default function SellerOrdersPage() {
  const orders = useBidWiseStore((state) => state.orders);
  const projects = useBidWiseStore((state) => state.projects);
  const users = useBidWiseStore((state) => state.users);
  const loading = useBidWiseStore((state) => state.loading);

  return (
    <RoleGuard role="seller">
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState label="Loading orders..." />
          ) : orders.length === 0 ? (
            <EmptyState title="No orders yet" description="Orders appear when a buyer accepts your bid." />
          ) : (
            <OrderTable orders={orders} projects={projects} users={users} mode="seller" />
          )}
        </CardContent>
      </Card>
    </RoleGuard>
  );
}
