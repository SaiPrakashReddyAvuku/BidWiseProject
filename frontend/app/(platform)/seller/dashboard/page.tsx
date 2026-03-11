"use client";

import { useMemo } from "react";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/role-guard";
import { ProjectCard } from "@/components/projects/project-card";
import { StatCard } from "@/components/common/stat-card";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";
import { formatCurrency } from "@/utils";

export default function SellerDashboardPage() {
  const user = useBidWiseStore((state) => state.currentUser);
  const allProjects = useBidWiseStore((state) => state.projects);
  const allBids = useBidWiseStore((state) => state.bids);

  const projects = useMemo(
    () => allProjects.filter((project) => project.status === "open"),
    [allProjects]
  );
  const myBids = useMemo(
    () => allBids.filter((bid) => bid.sellerId === user?.id),
    [allBids, user?.id]
  );
  const wonBids = useMemo(
    () => myBids.filter((bid) => bid.status === "accepted"),
    [myBids]
  );
  const earnings = useMemo(
    () => wonBids.reduce((sum, bid) => sum + bid.price, 0),
    [wonBids]
  );

  return (
    <RoleGuard role="seller">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Available projects" value={projects.length} />
          <StatCard title="My bids" value={myBids.length} />
          <StatCard title="Won projects" value={wonBids.length} />
          <StatCard title="Earnings summary" value={formatCurrency(earnings)} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {projects.slice(0, 4).map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              href={`/seller/projects/${project.id}`}
              bidCount={allBids.filter((bid) => bid.projectId === project.id).length}
            />
          ))}
        </div>
        <Link href="/seller/projects" className="text-sm text-primary">Browse all projects</Link>
      </div>
    </RoleGuard>
  );
}
