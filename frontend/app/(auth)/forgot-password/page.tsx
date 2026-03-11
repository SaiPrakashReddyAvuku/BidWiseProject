"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";

export default function ForgotPasswordPage() {
  const users = useBidWiseStore((state) => state.users);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "not-found">("idle");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const exists = users.some((item) => item.email.toLowerCase() === email.toLowerCase());
    setStatus(exists ? "sent" : "not-found");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            {status === "sent" ? <p className="text-sm text-green-700">Reset link simulated for {email}.</p> : null}
            {status === "not-found" ? <p className="text-sm text-amber-700">No account found for {email}. Try a demo email from README.</p> : null}
            <Button type="submit" className="w-full">Send reset link</Button>
            <p className="text-sm text-muted-foreground">
              <Link href="/login" className="text-primary">Back to login</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
