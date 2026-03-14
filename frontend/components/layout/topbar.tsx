"use client";

import { LogOut, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";

const resolveInitialTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("bidwise-theme");
  if (stored === "dark" || stored === "light") {
    return stored;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const applyTheme = (value: "light" | "dark") => {
  const root = document.documentElement;
  root.setAttribute("data-theme", value);
  root.classList.toggle("dark", value === "dark");
};

export function Topbar() {
  const user = useBidWiseStore((state) => state.currentUser);
  const notifications = useBidWiseStore((state) => state.notifications);
  const logout = useBidWiseStore((state) => state.logout);
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const initial = resolveInitialTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    window.localStorage.setItem("bidwise-theme", next);
  };

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <header className="px-4 pt-3 lg:px-8">
      <div className="glass-panel flex h-16 items-center justify-between rounded-2xl px-4 lg:px-6">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <div className="flex items-center gap-2">
            <p className="font-semibold tracking-tight">{user?.name}</p>
            <Badge variant={unreadCount > 0 ? "success" : "secondary"}>{unreadCount} alerts</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />} Theme
          </Button>
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
      </div>
    </header>
  );
}
