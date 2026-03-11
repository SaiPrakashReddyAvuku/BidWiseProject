"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";

export default function CreateProjectPage() {
  const router = useRouter();
  const createProject = useBidWiseStore((state) => state.createProject);
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: 5000,
    category: "Web Development",
    deadline: "",
    attachments: "scope.pdf",
    location: "Remote"
  });
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      await createProject({
        ...form,
        attachments: form.attachments.split(",").map((item) => item.trim())
      });
      router.push("/buyer/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create project.";
      setError(message);
    }
  };

  return (
    <RoleGuard role="buyer">
      <Card className="mx-auto max-w-3xl">
        <CardHeader><CardTitle>Create Project</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <div><Label>Project title</Label><Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} required /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} required /></div>
            <div><Label>Budget</Label><Input type="number" value={form.budget} onChange={(event) => setForm((prev) => ({ ...prev, budget: Number(event.target.value) }))} required /></div>
            <div><Label>Category</Label><Select value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}><option>Web Development</option><option>AI Solutions</option><option>Design</option><option>Marketing</option></Select></div>
            <div><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={(event) => setForm((prev) => ({ ...prev, deadline: event.target.value }))} required /></div>
            <div><Label>File attachments (comma-separated)</Label><Input value={form.attachments} onChange={(event) => setForm((prev) => ({ ...prev, attachments: event.target.value }))} /></div>
            <div><Label>Location</Label><Input value={form.location} onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))} /></div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit">Post project</Button>
          </form>
        </CardContent>
      </Card>
    </RoleGuard>
  );
}
