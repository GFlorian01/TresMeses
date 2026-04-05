import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <Skeleton className="h-6 w-32 mt-2" />

        {/* Score y Racha */}
        <div className="grid grid-cols-2 gap-3">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="overflow-hidden relative">
              <Skeleton className="absolute top-0 left-0 right-0 h-1" />
              <CardContent className="pt-5 pb-4">
                <Skeleton className="h-3 w-20 mb-3" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Calendario */}
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-28" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <Skeleton className="h-3 w-4" />
                  <Skeleton className="w-10 h-10 rounded-xl" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gym */}
        <Card className="overflow-hidden relative">
          <Skeleton className="absolute top-0 left-0 right-0 h-1" />
          <CardContent className="pt-5 pb-4">
            <Skeleton className="h-3 w-40 mb-3" />
            <div className="flex gap-2 mb-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-3 flex-1 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-6 w-20" />
          </CardContent>
        </Card>

        {/* Ciclo */}
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-36" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-1">
              {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className="h-2 flex-1 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-3 w-40 mt-3" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
