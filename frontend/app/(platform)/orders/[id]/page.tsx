"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { EmptyState } from "@/components/common/empty-state";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/status-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";
import { DeliveryType } from "@/types";
import { formatCurrency, formatDate } from "@/utils";

const statusFlow = ["created", "preparing", "shipped", "delivered", "completed"] as const;

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;
  const orders = useBidWiseStore((state) => state.orders);
  const projects = useBidWiseStore((state) => state.projects);
  const users = useBidWiseStore((state) => state.users);
  const currentUser = useBidWiseStore((state) => state.currentUser);
  const loading = useBidWiseStore((state) => state.loading);
  const updateOrderStatus = useBidWiseStore((state) => state.updateOrderStatus);
  const completeOrder = useBidWiseStore((state) => state.completeOrder);
  const createPaymentIntent = useBidWiseStore((state) => state.createPaymentIntent);
  const updateOrderDelivery = useBidWiseStore((state) => state.updateOrderDelivery);

  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [paymentSecret, setPaymentSecret] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("digital");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  const order = useMemo(
    () => orders.find((item) => item.id === orderId),
    [orders, orderId]
  );

  const project = projects.find((item) => item.id === order?.projectId);
  const buyer = users.find((user) => user.id === order?.buyerId);
  const seller = users.find((user) => user.id === order?.sellerId);

  const resolvedDeliveryType = order?.deliveryType ?? deliveryType;
  const resolvedDeliveryAddress = order?.deliveryAddress ?? deliveryAddress;
  const resolvedDeliveryInstructions = order?.deliveryInstructions ?? deliveryInstructions;

  if (!order && loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Loading order...</CardTitle></CardHeader>
      </Card>
    );
  }

  if (!order || !currentUser) {
    return <EmptyState title="Order not found" description="This order might not exist or you no longer have access." />;
  }

  const isBuyer = currentUser.id === order.buyerId;
  const isSeller = currentUser.id === order.sellerId;
  const isAdmin = currentUser.role === "admin";

  if (!isBuyer && !isSeller && !isAdmin) {
    return <EmptyState title="Access restricted" description="You do not have access to this order." />;
  }

  const currentIndex = statusFlow.indexOf(order.status);
  const nextStatus = isSeller && currentIndex >= 0 && currentIndex < statusFlow.length - 1
    ? statusFlow[currentIndex + 1]
    : null;

  const onAdvanceStatus = async () => {
    if (!nextStatus) return;
    setActionError("");
    setActionMessage("");
    try {
      await updateOrderStatus(order.id, nextStatus);
      setActionMessage(`Order marked as ${nextStatus}.`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to update order status.");
    }
  };

  const onConfirmDelivery = async () => {
    setActionError("");
    setActionMessage("");
    try {
      await completeOrder(order.id);
      setActionMessage("Delivery confirmed. Order completed.");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to complete order.");
    }
  };

  const onCreatePaymentIntent = async () => {
    setActionError("");
    setActionMessage("");
    try {
      const secret = await createPaymentIntent(order.id);
      setPaymentSecret(secret);
      setActionMessage("Payment intent created. Complete payment on the Stripe client.");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to create payment intent.");
    }
  };

  const onSaveDelivery = async () => {
    setActionError("");
    setActionMessage("");
    try {
      await updateOrderDelivery(order.id, {
        deliveryType,
        deliveryAddress: deliveryType === "physical" ? deliveryAddress : undefined,
        deliveryInstructions
      });
      setActionMessage("Delivery details saved.");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to save delivery details.");
    }
  };

  useEffect(() => {
    if (!order) return;
    if (order.deliveryType) {
      setDeliveryType(order.deliveryType);
    }
    if (order.deliveryAddress) {
      setDeliveryAddress(order.deliveryAddress);
    }
    if (order.deliveryInstructions) {
      setDeliveryInstructions(order.deliveryInstructions);
    }
  }, [order]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Order Details</CardTitle>
              <p className="text-sm text-muted-foreground">Created {formatDate(order.createdAt)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={order.status} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 text-sm">
            <p className="font-semibold">Project</p>
            <p>{project?.title ?? `Project ${order.projectId.slice(0, 8)}`}</p>
            <p>Buyer: {buyer?.name ?? "Buyer"}</p>
            <p>Seller: {seller?.name ?? "Seller"}</p>
            <p>Price: {formatCurrency(order.price)}</p>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-semibold">Progress</p>
            <ol className="space-y-2">
              {statusFlow.map((step, index) => (
                <li key={step} className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      index <= currentIndex ? "bg-emerald-400" : "bg-muted"
                    }`}
                  />
                  <span className={index <= currentIndex ? "font-semibold" : "text-muted-foreground"}>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {isSeller && nextStatus ? (
              <Button onClick={() => void onAdvanceStatus()}>
                Mark as {nextStatus}
              </Button>
            ) : null}
            {isBuyer && order.status === "delivered" ? (
              <Button onClick={() => void onConfirmDelivery()}>
                Confirm Delivery
              </Button>
            ) : null}
            {isBuyer && order.paymentStatus !== "paid" ? (
              <Button variant="outline" onClick={() => void onCreatePaymentIntent()}>
                Create Payment Intent
              </Button>
            ) : null}
            {paymentSecret ? (
              <div className="rounded-lg border border-white/20 bg-white/40 p-3 text-xs text-muted-foreground dark:bg-slate-900/40">
                <p className="font-semibold text-foreground">Client secret</p>
                <p className="break-all">{paymentSecret}</p>
              </div>
            ) : null}
            {actionMessage ? <p className="text-emerald-500">{actionMessage}</p> : null}
            {actionError ? <p className="text-red-500">{actionError}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Delivery Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {isBuyer ? (
              <>
                <div className="grid gap-2">
                  <Label>Delivery Type</Label>
                  <Select value={resolvedDeliveryType} onChange={(event) => setDeliveryType(event.target.value as DeliveryType)}>
                    <option value="digital">Digital</option>
                    <option value="physical">Physical</option>
                  </Select>
                </div>
                {resolvedDeliveryType === "physical" ? (
                  <div className="grid gap-2">
                    <Label>Delivery Address</Label>
                    <Input value={resolvedDeliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} placeholder="Street, City, State, ZIP" />
                  </div>
                ) : null}
                <div className="grid gap-2">
                  <Label>Instructions</Label>
                  <Textarea value={resolvedDeliveryInstructions} onChange={(event) => setDeliveryInstructions(event.target.value)} placeholder="Access details, contact, notes" />
                </div>
                <Button variant="outline" onClick={() => void onSaveDelivery()}>Save delivery details</Button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">Delivery type: {order.deliveryType ?? "Not provided"}</p>
                {order.deliveryType === "physical" ? (
                  <p>Address: {order.deliveryAddress ?? "Not provided"}</p>
                ) : null}
                {order.deliveryInstructions ? <p>Instructions: {order.deliveryInstructions}</p> : null}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
