"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("buyer@bidwise.com");
  const [password, setPassword] = useState("password");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const success = await login(email, password);
    if (!success) {
      setError("User not found or blocked.");
      return;
    }

    void remember;
    const role = useBidWiseStore.getState().currentUser?.role;
    router.push(role === "seller" ? "/seller/dashboard" : role === "admin" ? "/admin/dashboard" : "/buyer/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login to BidWise</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <Label>Email</Label>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
              Remember me
            </label>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit" className="w-full">Login</Button>
            <div className="flex justify-between text-sm">
              <Link href="/forgot-password" className="text-primary">Forgot password?</Link>
              <Link href="/register" className="text-primary">Create account</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}



