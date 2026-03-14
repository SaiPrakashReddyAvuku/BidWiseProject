import { Badge } from "@/components/ui/badge";
import { Order, PaymentStatus } from "@/types";

const orderLabel = (status: Order["status"]) =>
  status
    .replace("_", " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const orderVariant = (status: Order["status"]) => {
  if (status === "completed") return "success";
  if (status === "delivered") return "default";
  if (status === "shipped") return "secondary";
  return "secondary";
};

const paymentVariant = (status: PaymentStatus) => {
  if (status === "paid") return "success";
  if (status === "failed") return "danger";
  return "secondary";
};

export function OrderStatusBadge({ status }: { status: Order["status"] }) {
  return <Badge variant={orderVariant(status)}>{orderLabel(status)}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={paymentVariant(status)}>{status}</Badge>;
}
