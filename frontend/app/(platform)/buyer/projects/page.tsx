"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import { EmptyState } from "@/components/common/empty-state";
import { StatCard } from "@/components/common/stat-card";
import { ProjectCountdownCard } from "@/components/projects/project-countdown-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLiveClock } from "@/hooks/use-live-clock";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";
import { formatCurrency, formatDate } from "@/utils";
import { getBuyerKpi, getProjectSpecificBids } from "@/utils/buyer-insights";

export default function BuyerProjectsPage() {
  const searchParams = useSearchParams();
  const showClosedOnly = searchParams.get("view") === "closed";

  const projects = useBidWiseStore((state) => state.projects);
  const bids = useBidWiseStore((state) => state.bids);
  const users = useBidWiseStore((state) => state.users);
  const nowMs = useLiveClock(1000);

  const kpi = useMemo(() => getBuyerKpi(projects, bids), [bids, projects]);

  const rows = useMemo(
    () =>
      projects.map((project) => {
        const projectBids = getProjectSpecificBids(bids, project.id);
        const acceptedBid = projectBids.find((item) => item.status === "accepted");
        const winningSeller = acceptedBid
          ? users.find((user) => user.id === acceptedBid.sellerId)
          : undefined;

        return {
          project,
          bidCount: projectBids.length,
          acceptedBid,
          winningSeller,
          isClosed: project.status === "completed"
        };
      }),
    [bids, projects, users]
  );

  const activeRows = useMemo(
    () => rows.filter((item) => item.project.status !== "completed"),
    [rows]
  );

  const visibleRows = useMemo(
    () => (showClosedOnly ? rows.filter((item) => item.isClosed) : rows),
    [rows, showClosedOnly]
  );

  const historyTitle = showClosedOnly ? "Closed / Rejected Projects" : "Project History";

  return (
    <RoleGuard role="buyer">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-5">
          <StatCard title="Total Projects Created" value={kpi.totalProjects} />
          <StatCard title="Total Money Spent" value={formatCurrency(kpi.totalMoneySpent)} />
          <StatCard title="Average Bid Received" value={formatCurrency(kpi.averageBidReceived)} />
          <StatCard title="Completed Projects" value={kpi.completedProjects} href="/buyer/projects?view=closed" subtitle="View closed projects" />
          <StatCard title="Successful Projects" value={`${kpi.successfulProjectsPercentage}%`} />
        </div>

        {rows.length === 0 ? (
          <EmptyState title="No projects found" description="Create your first project to start receiving bids." />
        ) : (
          <>
            {!showClosedOnly ? (
              <Card>
                <CardHeader><CardTitle>Active Projects</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {activeRows.map((item) => (
                      <ProjectCountdownCard
                        key={item.project.id}
                        project={item.project}
                        bidders={item.bidCount}
                        nowMs={nowMs}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>{historyTitle}</CardTitle>
                  {showClosedOnly ? <Link href="/buyer/projects" className="text-sm text-primary">Show all projects</Link> : null}
                </div>
              </CardHeader>
              <CardContent>
                {visibleRows.length === 0 ? (
                  <EmptyState title="No closed projects yet" description="Completed or rejected-bid projects will appear here." />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Bids</TableHead>
                        <TableHead>Winner Bidder</TableHead>
                        <TableHead>Winning Bid</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleRows.map((row) => (
                        <TableRow key={row.project.id}>
                          <TableCell>{row.project.title}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant={row.project.status === "completed" ? "success" : "secondary"}>
                                {row.project.status}
                              </Badge>
                              {row.project.closureReason ? (
                                <Badge variant="warning" className="w-fit">{row.project.closureReason}</Badge>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(row.project.deadline)}</TableCell>
                          <TableCell>{row.bidCount}</TableCell>
                          <TableCell>{row.winningSeller?.name ?? "No winner"}</TableCell>
                          <TableCell>{row.acceptedBid ? formatCurrency(row.acceptedBid.price) : "No winner"}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <Link href={`/buyer/projects/${row.project.id}`} className="text-primary">View</Link>
                              <Link href={`/buyer/bids/compare/${row.project.id}`} className="text-primary">Compare</Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </RoleGuard>
  );
}
