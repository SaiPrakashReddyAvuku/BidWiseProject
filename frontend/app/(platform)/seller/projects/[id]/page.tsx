"use client";

import { FormEvent, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import { AttachmentList } from "@/components/projects/attachment-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";
import { formatCurrency } from "@/utils";

export default function SellerProjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const user = useBidWiseStore((state) => state.currentUser);
  const projects = useBidWiseStore((state) => state.projects);
  const allBids = useBidWiseStore((state) => state.bids);
  const users = useBidWiseStore((state) => state.users);
  const placeBid = useBidWiseStore((state) => state.placeBid);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ price: 0, deliveryDays: 10, proposal: "" });

  const project = useMemo(
    () => projects.find((item) => item.id === id),
    [projects, id]
  );
  const bids = useMemo(
    () => allBids.filter((bid) => bid.projectId === id),
    [allBids, id]
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    await placeBid({
      projectId: id,
      sellerId: user.id,
      price: form.price,
      deliveryDays: form.deliveryDays,
      proposal: form.proposal
    });
    setOpen(false);
  };

  if (!project) return <RoleGuard role="seller"><p>Project not found.</p></RoleGuard>;

  const buyer = users.find((item) => item.id === project.buyerId);
  const lowestBid = bids.slice().sort((a, b) => a.price - b.price)[0];

  return (
    <RoleGuard role="seller">
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>{project.title}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>{project.description}</p>
            <p>Budget: {formatCurrency(project.budget)}</p>
            <div>
              <p className="mb-1">Attachments</p>
              <AttachmentList attachments={project.attachments} />
            </div>
            <p>Buyer: {buyer?.name} ({buyer?.companyName ?? "No company"})</p>
            <Button onClick={() => setOpen(true)}>Place Bid</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Live bids</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Lowest bid: {lowestBid ? formatCurrency(lowestBid.price) : "No bids yet"}</p>
            {bids.map((bid) => (
              <p key={bid.id}>- {formatCurrency(bid.price)} in {bid.deliveryDays} days</p>
            ))}
          </CardContent>
        </Card>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Place Bid" description="Submitting updates the bid list immediately.">
        <form className="grid gap-3" onSubmit={onSubmit}>
          <div><Label>Bid price</Label><Input type="number" value={form.price || ""} onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))} required /></div>
          <div><Label>Delivery time (days)</Label><Input type="number" value={form.deliveryDays} onChange={(event) => setForm((prev) => ({ ...prev, deliveryDays: Number(event.target.value) }))} required /></div>
          <div><Label>Proposal message</Label><Textarea value={form.proposal} onChange={(event) => setForm((prev) => ({ ...prev, proposal: event.target.value }))} required /></div>
          <Button type="submit">Submit bid</Button>
        </form>
      </Modal>
    </RoleGuard>
  );
}

