import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getReviewPageData } from "@/lib/review-queries";
import { ReviewForm } from "@/components/review/review-form";
import { ReviewHistory } from "@/components/review/review-history";
import { ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function ReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const data = await getReviewPageData(user.id);

  if (!data.hasCycle) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-lg mx-auto p-4">
          <div className="flex items-center gap-2 pt-2 mb-4">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">
              Revision semanal
            </h1>
          </div>
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Necesitas crear un ciclo primero.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ve a{" "}
                <span className="text-primary font-medium">Config</span> para
                iniciar uno.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <div className="flex items-center gap-2 pt-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">
            Revision semanal
          </h1>
        </div>

        <ReviewForm
          userId={user.id}
          cycleId={data.cycle.id}
          weekNumber={data.currentWeek}
          weekScore={data.weekScore}
          existingReview={data.existingReview}
        />

        <ReviewHistory reviews={data.allReviews} />
      </div>
    </div>
  );
}
