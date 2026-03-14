import Link from "next/link";
import { Order, Project, User } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/status-badges";
import { formatCurrency, formatDate } from "@/utils";

export function OrderTable({
  orders,
  projects,
  users,
  mode
}: {
  orders: Order[];
  projects: Project[];
  users: User[];
  mode: "buyer" | "seller";
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>{mode === "buyer" ? "Seller" : "Buyer"}</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const project = projects.find((item) => item.id === order.projectId);
          const counterpartyId = mode === "buyer" ? order.sellerId : order.buyerId;
          const counterparty = users.find((user) => user.id === counterpartyId);

          return (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{project?.title ?? `Project ${order.projectId.slice(0, 8)}`}</TableCell>
              <TableCell>{counterparty?.name ?? "Unknown"}</TableCell>
              <TableCell>{formatCurrency(order.price)}</TableCell>
              <TableCell><OrderStatusBadge status={order.status} /></TableCell>
              <TableCell><PaymentStatusBadge status={order.paymentStatus} /></TableCell>
              <TableCell>{formatDate(order.createdAt)}</TableCell>
              <TableCell>
                <Link href={`/orders/${order.id}`} className="text-primary">View</Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
