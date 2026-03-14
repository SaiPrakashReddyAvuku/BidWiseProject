"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";
import Link from "next/link";

export default function ContractPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const order = useBidWiseStore((state) =>
    state.orders.find((item) => item.id === id || item.bidId === id)
  );
  const contract = useBidWiseStore((state) =>
    state.contracts.find((item) => item.bidId === id || item.id === id)
  );
  const loading = useBidWiseStore((state) => state.loading);

  if (!order && !contract && loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Loading contract...</CardTitle></CardHeader>
      </Card>
    );
  }

  if (order) {
    return (
      <Card>
        <CardHeader><CardTitle>Order Available</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>This contract is now managed as an order.</p>
          <Link href={`/orders/${order.id}`} className="text-primary">Open order details</Link>
        </CardContent>
      </Card>
    );
  }

  if (!contract) {
    return (
      <Card>
        <CardHeader><CardTitle>No contract found</CardTitle></CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>Order / Contract</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>Agreement summary for project: {contract.projectId}</p>
        <p>Timeline:</p>
        <ul className="list-disc pl-5">
          {contract.timeline.map((step) => <li key={step}>{step}</li>)}
        </ul>
        <p>Payment status: <Badge variant={contract.paymentStatus === "paid" ? "success" : "secondary"}>{contract.paymentStatus}</Badge></p>
        <p>Work progress: {contract.progress}%</p>
      </CardContent>
    </Card>
  );
}
