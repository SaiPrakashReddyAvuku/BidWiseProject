"use client";

import { ReactNode, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: ReactNode }) {
  const user = useBidWiseStore((state) => state.currentUser);
  const syncForCurrentUser = useBidWiseStore((state) => state.syncForCurrentUser);
  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      void syncForCurrentUser();
    }
  }, [syncForCurrentUser, userId]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="glass-panel max-w-md space-y-3 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold">Authentication Required</h1>
          <p className="text-muted-foreground">Please login to access platform dashboards.</p>
          <Button asChild>
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role={user.role} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
