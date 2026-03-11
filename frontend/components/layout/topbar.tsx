"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";

export function Topbar() {
  const user = useBidWiseStore((state) => state.currentUser);
  const logout = useBidWiseStore((state) => state.logout);
  const router = useRouter();

  return (
    <header className="px-4 pt-3 lg:px-8">
      <div className="glass-panel flex h-16 items-center justify-between rounded-2xl px-4 lg:px-6">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <p className="font-semibold tracking-tight">{user?.name}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            logout();
            router.push("/login");
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
    </header>
  );
}
