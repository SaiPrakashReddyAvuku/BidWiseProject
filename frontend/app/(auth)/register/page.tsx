"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/types";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("buyer");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const success = await register({ name, email, password, role, phone, companyName });
    if (!success) {
      setError("Email already exists.");
      return;
    }
    router.push(role === "buyer" ? "/buyer/dashboard" : role === "seller" ? "/seller/dashboard" : "/admin/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader><CardTitle>Create a BidWise account</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <div><Label>Name</Label><Input value={name} onChange={(event) => setName(event.target.value)} required /></div>
            <div><Label>Email</Label><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
            <div><Label>Password</Label><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
            <div><Label>Confirm password</Label><Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></div>
            <div>
              <Label>Role</Label>
              <Select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </Select>
            </div>
            <div><Label>Phone (optional)</Label><Input value={phone} onChange={(event) => setPhone(event.target.value)} /></div>
            <div><Label>Company (optional)</Label><Input value={companyName} onChange={(event) => setCompanyName(event.target.value)} /></div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit">Register</Button>
            <p className="text-sm text-muted-foreground">Already registered? <Link href="/login" className="text-primary">Login</Link></p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


