"use client";

import { useMemo } from "react";
import { RoleGuard } from "@/components/auth/role-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBidWiseStore } from "@/features/store/use-bidwise-store";

export default function SellerProfilePage() {
  const user = useBidWiseStore((state) => state.currentUser);
  const allReviews = useBidWiseStore((state) => state.reviews);

  const reviews = useMemo(
    () => allReviews.filter((review) => review.toUserId === user?.id),
    [allReviews, user?.id]
  );

  return (
    <RoleGuard role="seller">
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Seller Profile</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Name: {user?.name}</p>
            <p>Skills: {user?.skills?.join(", ") || "Not set"}</p>
            <p>Portfolio: https://portfolio.example.com/{user?.id}</p>
            <p>Rating: {user?.rating ?? "-"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Reviews</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {reviews.map((review) => (
              <p key={review.id}>- {review.rating}/5 - {review.comment}</p>
            ))}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
