import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WeeklyReview } from "@/types/database";

export function ReviewHistory({ reviews }: { reviews: WeeklyReview[] }) {
  if (reviews.length === 0) return null;

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          Historial
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {reviews.map((review) => {
          const isGood = (review.score ?? 0) >= 85;
          return (
            <div
              key={review.id}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 bg-accent/30"
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  isGood ? "bg-green-500" : "bg-red-500"
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Semana {review.week_number}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-bold tabular-nums",
                      isGood ? "text-green-500" : "text-red-500"
                    )}
                  >
                    {review.score ?? 0}%
                  </span>
                </div>
                {review.reflection && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {review.reflection}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
