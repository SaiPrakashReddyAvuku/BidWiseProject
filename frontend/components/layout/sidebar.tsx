"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BriefcaseBusiness,
  ChartNoAxesColumn,
  Gauge,
  Gavel,
  MessageCircle,
  Package,
  Settings,
  ShieldCheck,
  Star,
  Users
} from "lucide-react";
import { cn } from "@/utils";
import { UserRole } from "@/types";

type NavLink = {
  href: string;
  label: string;
  icon: typeof Gauge;
};

const roleLinks: Record<UserRole, NavLink[]> = {
  buyer: [
    { href: "/buyer/dashboard", label: "Dashboard", icon: Gauge },
    { href: "/buyer/projects", label: "My Projects", icon: BriefcaseBusiness },
    { href: "/buyer/projects/create", label: "Create Project", icon: BriefcaseBusiness },
    { href: "/buyer/bids/compare", label: "Bid Comparison", icon: Gavel },
    { href: "/buyer/orders", label: "Orders", icon: Package },
    { href: "/buyer/analytics", label: "Analytics", icon: ChartNoAxesColumn },
    { href: "/reviews", label: "Reviews", icon: Star },
    { href: "/messages", label: "Messages", icon: MessageCircle },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/settings", label: "Settings", icon: Settings }
  ],
  seller: [
    { href: "/seller/dashboard", label: "Seller Dashboard", icon: Gauge },
    { href: "/seller/projects", label: "Browse Projects", icon: BriefcaseBusiness },
    { href: "/seller/my-bids", label: "My Bids", icon: Gavel },
    { href: "/seller/orders", label: "Orders", icon: Package },
    { href: "/seller/profile", label: "Profile", icon: Users },
    { href: "/reviews", label: "Reviews", icon: Star },
    { href: "/messages", label: "Messages", icon: MessageCircle },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/settings", label: "Settings", icon: Settings }
  ],
  admin: [
    { href: "/admin/dashboard", label: "Admin Dashboard", icon: Gauge },
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/admin/moderation", label: "Project Moderation", icon: ShieldCheck },
    { href: "/admin/disputes", label: "Disputes", icon: Gavel },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/messages", label: "Messages", icon: MessageCircle },
    { href: "/settings", label: "Settings", icon: Settings }
  ]
};

const isLinkActive = (pathname: string, href: string) => {
  if (pathname === href) {
    return true;
  }

  if (href === "/buyer/projects") {
    return pathname.startsWith("/buyer/projects/") && !pathname.startsWith("/buyer/projects/create");
  }

  return pathname.startsWith(`${href}/`);
};

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const links = roleLinks[role];

  return (
    <aside className="hidden w-72 p-3 lg:block">
      <div className="glass-panel sticky top-3 rounded-2xl">
        <div className="flex h-16 items-center border-b border-white/25 px-6">
          <Link href="/" className="text-xl font-bold tracking-tight text-primary">
            BidWise
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isLinkActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition duration-200",
                  active
                    ? "bg-primary/90 text-white shadow-md shadow-sky-700/30"
                    : "text-muted-foreground hover:bg-white/40 hover:text-foreground dark:hover:bg-slate-800/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
