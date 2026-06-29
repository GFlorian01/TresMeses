import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getReviewPageData } from "@/lib/review-queries";
import { ReviewForm } from "@/components/review/review-form";
import { ReviewHistory } from "@/components/review/review-history";
import { ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const requestedWeek = params.week ? parseInt(params.week) : undefined;

  const data = await getReviewPageData(user.id, requestedWeek);

  if (!data.hasCycle) {
    return (
      <div className="min-h-screen bg-background pb-24 lg:pb-8">
        <div className="max-w-lg lg:max-w-3xl mx-auto p-4 lg:p-8">
          <div className="flex items-center gap-2 pt-2 mb-4">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">Revision semanal</h1>
          </div>
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Necesitas crear un ciclo primero.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ve a <span className="text-primary font-medium">Config</span> para iniciar uno.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      <div className="max-w-lg lg:max-w-3xl mx-auto p-4 lg:p-8 space-y-4 lg:space-y-6">
        <div className="flex items-center gap-2 pt-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Revision semanal</h1>
        </div>

        <ReviewForm
          userId={user.id}
          cycleId={data.cycle.id}
          viewWeek={data.viewWeek}
          currentWeek={data.currentWeek}
          weekScore={data.weekScore}
          weekScores={data.weekScores}
          dailyGrid={data.dailyGrid}
          existingReview={data.existingReview}
          isSunday={data.isSunday}
        />

        <ReviewHistory reviews={data.allReviews} />
      </div>
    </div>
  );
}
