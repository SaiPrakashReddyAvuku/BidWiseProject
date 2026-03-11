"use client";

import { ReactNode } from "react";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";
import { UserRole } from "@/types";

export function RoleGuard({ role, children }: { role: UserRole; children: ReactNode }) {
  const user = useBidWiseStore((state) => state.currentUser);

  if (!user || user.role !== role) {
    return (
      <div className="glass-panel rounded-xl p-6">
        <h2 className="text-lg font-semibold">Access restricted</h2>
        <p className="text-sm text-muted-foreground">This page is only available to {role}s.</p>
      </div>
    );
  }

  return <>{children}</>;
}



