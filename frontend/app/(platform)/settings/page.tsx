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
  const resetPassword = useBidWiseStore((state) => state.resetPassword);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [companyName, setCompanyName] = useState(user?.companyName ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("Stripe Account: demo-account");
  const [status, setStatus] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("");
    await updateSettings({ name, phone, companyName });

    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        setStatus("Passwords do not match.");
        return;
      }
      const message = await resetPassword(password);
      setStatus(message || "Password updated.");
      setPassword("");
      setConfirmPassword("");
    }
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
          <div><Label>New password</Label><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Update password" /></div>
          <div><Label>Confirm new password</Label><Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm password" /></div>
          <div><Label>Payment details</Label><Input value={paymentDetails} onChange={(event) => setPaymentDetails(event.target.value)} /></div>
          {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
          <Button type="submit">Save changes</Button>
        </form>
      </CardContent>
    </Card>
  );
}



