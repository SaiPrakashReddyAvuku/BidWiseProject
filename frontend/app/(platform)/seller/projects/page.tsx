"use client";

import { useMemo, useState } from "react";
import { RoleGuard } from "@/components/auth/role-guard";
import { ProjectCard } from "@/components/projects/project-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";

export default function BrowseProjectsPage() {
  const allProjects = useBidWiseStore((state) => state.projects);
  const allBids = useBidWiseStore((state) => state.bids);
  const [category, setCategory] = useState("all");
  const [budget, setBudget] = useState(0);
  const [deadline, setDeadline] = useState("");
  const [location, setLocation] = useState("");

  const projects = useMemo(
    () => allProjects.filter((project) => project.status === "open"),
    [allProjects]
  );

  const categoryOptions = useMemo(() => {
    const categories = new Set<string>();

    projects.forEach((project) => {
      project.category
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => categories.add(item));
    });

    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }, [projects]);

  const filtered = useMemo(
    () =>
      projects.filter((project) => {
        const projectCategories = project.category
          .split(",")
          .map((item) => item.trim().toLowerCase())
          .filter(Boolean);

        if (category !== "all" && !projectCategories.includes(category.toLowerCase())) return false;
        if (budget > 0 && project.budget > budget) return false;
        if (deadline && project.deadline > deadline) return false;
        if (location && !project.location.toLowerCase().includes(location.toLowerCase())) return false;
        return true;
      }),
    [budget, category, deadline, location, projects]
  );

  return (
    <RoleGuard role="seller">
      <div className="space-y-4">
        <div className="glass-panel grid gap-3 rounded-2xl p-4 md:grid-cols-4">
          <Select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">All categories</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </Select>
          <Input type="number" value={budget || ""} onChange={(event) => setBudget(Number(event.target.value))} placeholder="Max budget" />
          <Input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
          <Input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              href={`/seller/projects/${project.id}`}
              bidCount={allBids.filter((bid) => bid.projectId === project.id).length}
            />
          ))}
        </div>
      </div>
    </RoleGuard>
  );
}
