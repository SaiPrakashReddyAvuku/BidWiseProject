"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";

export default function SettingsPage() {
  const user = useBidWiseStore((state) => state.currentUser);
  const updateSettings = useBidWiseStore((state) => state.updateSettings);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [companyName, setCompanyName] = useState(user?.companyName ?? "");
  const [password, setPassword] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("Stripe Account: demo-account");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await updateSettings({ name, phone, companyName });
    void password;
    void paymentDetails;
  };

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div><Label>Profile name</Label><Input value={name} onChange={(event) => setName(event.target.value)} /></div>
          <div><Label>Phone</Label><Input value={phone} onChange={(event) => setPhone(event.target.value)} /></div>
          <div><Label>Company</Label><Input value={companyName} onChange={(event) => setCompanyName(event.target.value)} /></div>
          <div><Label>Password</Label><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Update password" /></div>
          <div><Label>Payment details</Label><Input value={paymentDetails} onChange={(event) => setPaymentDetails(event.target.value)} /></div>
          <Button type="submit">Save changes</Button>
        </form>
      </CardContent>
    </Card>
  );
}



