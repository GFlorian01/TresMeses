import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ReviewLoading() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <Skeleton className="h-6 w-40 mt-2" />

        {/* Score banner */}
        <Card className="overflow-hidden relative">
          <Skeleton className="absolute top-0 left-0 right-0 h-1" />
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <Card>
          <CardContent className="pt-6 space-y-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
            <Skeleton className="h-11 w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
