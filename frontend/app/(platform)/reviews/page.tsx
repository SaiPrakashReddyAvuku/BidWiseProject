"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";

export default function ReviewsPage() {
  const user = useBidWiseStore((state) => state.currentUser);
  const allUsers = useBidWiseStore((state) => state.users);
  const reviews = useBidWiseStore((state) => state.reviews);
  const addReview = useBidWiseStore((state) => state.addReview);

  const users = useMemo(
    () => allUsers.filter((item) => item.id !== user?.id),
    [allUsers, user?.id]
  );

  const [toUserId, setToUserId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const selectedToUserId = toUserId || users[0]?.id || "";

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedToUserId) return;
    addReview(selectedToUserId, rating, comment);
    setComment("");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Leave a Review</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-3">
            <select value={selectedToUserId} onChange={(event) => setToUserId(event.target.value)} className="h-10 w-full rounded-md border px-3">
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <Input type="number" min={1} max={5} value={rating} onChange={(event) => setRating(Number(event.target.value))} />
            <Textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Share your feedback" />
            <Button type="submit">Submit review</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Recent Ratings</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {reviews.slice(0, 10).map((review) => {
            const from = allUsers.find((item) => item.id === review.fromUserId);
            const to = allUsers.find((item) => item.id === review.toUserId);
            return <p key={review.id}>- {from?.name ?? review.fromUserId} rated {to?.name ?? review.toUserId}: {review.rating}/5</p>;
          })}
        </CardContent>
      </Card>
    </div>
  );
}
