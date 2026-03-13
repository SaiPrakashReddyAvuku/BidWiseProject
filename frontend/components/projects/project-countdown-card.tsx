import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/types";
import { formatCurrency } from "@/utils";
import { getTimeRemaining } from "@/utils/buyer-insights";

export function ProjectCountdownCard({
  project,
  bidders,
  nowMs
}: {
  project: Project;
  bidders: number;
  nowMs: number;
}) {
  const time = getTimeRemaining(project.deadline, nowMs);
  const budgetLow = Math.round(project.budget * 0.8);
  const budgetHigh = Math.round(project.budget * 1.1);

  return (
    <Card className="glass-hover overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{project.title}</CardTitle>
          <Badge variant={time.isClosed ? "danger" : "success"}>{time.isClosed ? "Bidding Closed" : "Active"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <p><span className="text-muted-foreground">Category:</span> {project.category}</p>
          <p><span className="text-muted-foreground">Bidders:</span> {bidders}</p>
          <p className="col-span-2"><span className="text-muted-foreground">Budget range:</span> {formatCurrency(budgetLow)} - {formatCurrency(budgetHigh)}</p>
        </div>
        <div className="rounded-xl border border-white/25 bg-white/40 p-2 text-xs dark:bg-slate-900/35">
          {time.label}
        </div>
        <div className="flex items-center justify-between">
          <Link href={`/buyer/projects/${project.id}`} className="text-primary">View project</Link>
          <Link href={`/buyer/bids/compare/${project.id}`} className="text-primary">Bid comparison</Link>
        </div>
      </CardContent>
    </Card>
  );
}
