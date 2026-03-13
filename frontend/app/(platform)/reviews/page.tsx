"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { api } from "@/features/services/api";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";
import { Review } from "@/types";

const tagOptions = ["communication", "delivery time", "quality"];

type EligibleReviewTarget = {
  key: string;
  toUserId: string;
  projectId: string;
  bidId: string;
  reason: string;
  label: string;
};

const extractTags = (comment: string) => {
  const match = comment.match(/^\[tags:\s*([^\]]+)\]/i);
  if (!match) return [];
  return match[1].split(",").map((item) => item.trim()).filter(Boolean);
};

export default function ReviewsPage() {
  const searchParams = useSearchParams();
  const requestedProjectId = searchParams.get("projectId") ?? "";
  const requestedSellerId = searchParams.get("sellerId") ?? "";
  const requestedBidId = searchParams.get("bidId") ?? "";

  const user = useBidWiseStore((state) => state.currentUser);
  const users = useBidWiseStore((state) => state.users);
  const projects = useBidWiseStore((state) => state.projects);
  const bids = useBidWiseStore((state) => state.bids);
  const addReview = useBidWiseStore((state) => state.addReview);

  const [targetKey, setTargetKey] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [history, setHistory] = useState<Review[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [status, setStatus] = useState("");

  const eligibleTargets = useMemo(() => {
    if (!user) return [];

    if (user.role !== "buyer") {
      return users
        .filter((item) => item.id !== user.id)
        .map((item) => ({
          key: item.id,
          toUserId: item.id,
          projectId: "",
          bidId: "",
          reason: "General review",
          label: `${item.name} (general)`
        }));
    }

    const items: EligibleReviewTarget[] = [];

    projects.forEach((project) => {
      const projectBids = bids.filter((bid) => bid.projectId === project.id);
      projectBids.forEach((bid) => {
        const eligible =
          (project.status === "completed" && bid.status === "accepted") || bid.status === "rejected";

        if (!eligible) return;

        const seller = users.find((item) => item.id === bid.sellerId);
        const reason = bid.status === "rejected" ? "Rejected bidder feedback" : "Delivered project review";
        items.push({
          key: `${project.id}:${bid.id}`,
          toUserId: bid.sellerId,
          projectId: project.id,
          bidId: bid.id,
          reason,
          label: `${project.title} -> ${seller?.name ?? "Seller"} (${reason})`
        });
      });
    });

    return items;
  }, [bids, projects, user, users]);

  useEffect(() => {
    if (!eligibleTargets.length) return;
    if (targetKey) return;

    const deepLinkMatch = eligibleTargets.find((item) =>
      (requestedBidId && item.bidId === requestedBidId) ||
      (requestedProjectId && requestedSellerId && item.projectId === requestedProjectId && item.toUserId === requestedSellerId)
    );

    setTargetKey((deepLinkMatch ?? eligibleTargets[0]).key);
  }, [eligibleTargets, requestedBidId, requestedProjectId, requestedSellerId, targetKey]);

  const selectedTarget = useMemo(
    () => eligibleTargets.find((item) => item.key === targetKey),
    [eligibleTargets, targetKey]
  );

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      if (!selectedTarget?.toUserId) {
        setHistory([]);
        return;
      }

      setLoadingHistory(true);
      try {
        const reviews = await api.getReviewsForUser(selectedTarget.toUserId);
        if (active) {
          setHistory(reviews);
        }
      } finally {
        if (active) {
          setLoadingHistory(false);
        }
      }
    };

    void loadHistory();
    return () => {
      active = false;
    };
  }, [selectedTarget?.toUserId]);

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTarget?.toUserId) return;

    const payloadComment = tags.length ? `[tags: ${tags.join(", ")}] ${comment}` : comment;

    try {
      await addReview(selectedTarget.toUserId, rating, payloadComment);
      setComment("");
      setTags([]);
      setStatus("Review submitted.");
      const refreshed = await api.getReviewsForUser(selectedTarget.toUserId);
      setHistory(refreshed);
    } catch (cause) {
      setStatus(cause instanceof Error ? cause.message : "Failed to submit review.");
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <Card>
        <CardHeader><CardTitle>Write Review</CardTitle></CardHeader>
        <CardContent>
          {eligibleTargets.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Reviews are enabled only when a project is delivered or a bidder has been rejected.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label>Eligible Bidder / Project</Label>
                <Select value={selectedTarget?.key ?? ""} onChange={(event) => setTargetKey(event.target.value)}>
                  {eligibleTargets.map((target) => (
                    <option key={target.key} value={target.key}>{target.label}</option>
                  ))}
                </Select>
              </div>

              <div>
                <Label>Rating</Label>
                <div className="mt-2 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                      title={`${value} star${value > 1 ? "s" : ""}`}
                      className="rounded-md p-1 transition-transform hover:scale-105"
                      onClick={() => setRating(value)}
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${
                          rating >= value
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-500/70 hover:text-amber-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">{rating} / 5</span>
                </div>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tagOptions.map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      size="sm"
                      variant={tags.includes(tag) ? "default" : "outline"}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Written feedback</Label>
                <Textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Describe communication, delivery time, and overall quality."
                  required
                />
              </div>

              {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
              <Button type="submit">Submit review</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Seller Review History</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          {loadingHistory ? <p className="text-muted-foreground">Loading review history...</p> : null}
          {!loadingHistory && history.length === 0 ? <p className="text-muted-foreground">No reviews yet.</p> : null}
          {history.map((review) => {
            const from = users.find((item) => item.id === review.fromUserId);
            const parsedTags = extractTags(review.comment);
            const message = review.comment.replace(/^\[tags:[^\]]+\]\s*/i, "");

            return (
              <div key={review.id} className="rounded-xl border border-white/25 bg-white/40 p-3 dark:bg-slate-900/35">
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-medium">{from?.name ?? "User"}</p>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star
                        key={value}
                        className={`h-4 w-4 ${
                          review.rating >= value ? "fill-amber-400 text-amber-400" : "text-slate-500/70"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {parsedTags.length ? (
                  <div className="mb-1 flex flex-wrap gap-1">
                    {parsedTags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                  </div>
                ) : null}
                <p className="text-muted-foreground">{message}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

