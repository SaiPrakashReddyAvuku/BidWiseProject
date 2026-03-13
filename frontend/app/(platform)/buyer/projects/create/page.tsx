"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";

const predefinedCategories = [
  "Web Development",
  "AI Solutions",
  "Design",
  "Marketing",
  "Mobile App Development",
  "Data & Analytics",
  "Other"
];

export default function CreateProjectPage() {
  const router = useRouter();
  const createProject = useBidWiseStore((state) => state.createProject);

  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: 5000,
    deadline: "",
    location: "Remote"
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Web Development"]);
  const [otherCategory, setOtherCategory] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState("");

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        if (category === "Other") {
          setOtherCategory("");
        }
        return prev.filter((item) => item !== category);
      }
      return [...prev, category];
    });
  };

  const onFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setSelectedFiles(files);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const baseCategories = selectedCategories.filter((item) => item !== "Other");
    const customCategory = otherCategory.trim();

    if (selectedCategories.includes("Other") && !customCategory) {
      setError("Please enter a category when selecting Other.");
      return;
    }

    const categoryList = [
      ...baseCategories,
      ...(customCategory ? [customCategory] : [])
    ]
      .map((item) => item.trim())
      .filter(Boolean);

    const uniqueCategoryList = Array.from(new Set(categoryList));

    if (uniqueCategoryList.length === 0) {
      setError("Select at least one category.");
      return;
    }

    try {
      await createProject({
        ...form,
        category: uniqueCategoryList.join(", "),
        attachments: selectedFiles.map((file) => file.name)
      });
      router.push("/buyer/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create project.";
      setError(message);
    }
  };

  return (
    <RoleGuard role="buyer">
      <Card className="mx-auto max-w-3xl">
        <CardHeader><CardTitle>Create Project</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <div>
              <Label>Project title</Label>
              <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} required />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} required />
            </div>

            <div>
              <Label>Budget</Label>
              <Input type="number" value={form.budget} onChange={(event) => setForm((prev) => ({ ...prev, budget: Number(event.target.value) }))} required />
            </div>

            <div>
              <Label>Categories (select multiple)</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {predefinedCategories.map((category) => (
                  <Button
                    key={category}
                    type="button"
                    size="sm"
                    variant={selectedCategories.includes(category) ? "default" : "outline"}
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              {selectedCategories.includes("Other") ? (
                <div className="mt-3">
                  <Label>Custom category</Label>
                  <Input
                    value={otherCategory}
                    onChange={(event) => setOtherCategory(event.target.value)}
                    placeholder="Enter your own category"
                    required
                  />
                </div>
              ) : null}
              <p className="mt-2 text-xs text-muted-foreground">
                Selected categories will be saved as a combined category value.
              </p>
            </div>

            <div>
              <Label>Deadline</Label>
              <Input type="date" value={form.deadline} onChange={(event) => setForm((prev) => ({ ...prev, deadline: event.target.value }))} required />
            </div>

            <div>
              <Label>File attachments (optional)</Label>
              <Input type="file" multiple onChange={onFileSelect} className="h-auto cursor-pointer py-2" />
              {selectedFiles.length ? (
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {selectedFiles.map((file) => (
                    <p key={`${file.name}-${file.size}`}>{file.name}</p>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  No files selected.
                </p>
              )}
            </div>

            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))} />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit">Post project</Button>
          </form>
        </CardContent>
      </Card>
    </RoleGuard>
  );
}
