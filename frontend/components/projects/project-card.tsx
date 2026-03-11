import Link from "next/link";
import { HoverPreview } from "@/components/common/hover-preview";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/types";
import { formatCurrency, formatDate } from "@/utils";

export function ProjectCard({ project, href, bidCount = 0 }: { project: Project; href: string; bidCount?: number }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">
            <HoverPreview
              trigger={
                <Link href={href} className="transition-colors hover:text-primary">
                  {project.title}
                </Link>
              }
            >
              <div className="space-y-2">
                <p className="text-sm font-semibold">{project.title}</p>
                <p className="text-xs text-muted-foreground">{project.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <p><span className="text-muted-foreground">Budget:</span> {formatCurrency(project.budget)}</p>
                  <p><span className="text-muted-foreground">Deadline:</span> {formatDate(project.deadline)}</p>
                  <p className="col-span-2"><span className="text-muted-foreground">Bids:</span> {bidCount}</p>
                </div>
              </div>
            </HoverPreview>
          </CardTitle>
          <Badge variant={project.status === "open" ? "success" : "secondary"}>{project.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="text-muted-foreground">{project.description}</p>
        <div className="flex items-center justify-between">
          <span>{formatCurrency(project.budget)}</span>
          <span className="text-muted-foreground">Due {formatDate(project.deadline)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

