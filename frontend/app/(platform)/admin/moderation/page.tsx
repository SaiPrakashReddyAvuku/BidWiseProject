"use client";

import { useMemo } from "react";
import { RoleGuard } from "@/components/auth/role-guard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";

export default function AdminModerationPage() {
  const projects = useBidWiseStore((state) => state.projects);
  const flaggedProjects = useMemo(
    () => projects.filter((project) => project.flagged),
    [projects]
  );

  return (
    <RoleGuard role="admin">
      <Card>
        <CardHeader><CardTitle>Project Moderation</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {flaggedProjects.map((project) => (
            <div key={project.id} className="rounded-md border p-3 text-sm">
              <div className="mb-1 flex items-center justify-between">
                <p className="font-semibold">{project.title}</p>
                <Badge variant="danger">Flagged: Spam/Fraud review</Badge>
              </div>
              <p className="text-muted-foreground">{project.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </RoleGuard>
  );
}
