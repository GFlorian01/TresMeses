import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      <div className="max-w-lg lg:max-w-5xl mx-auto p-4 lg:p-8 space-y-4 lg:space-y-6">
        <Skeleton className="h-6 w-36 mt-2" />

        {/* Desktop: columna usuario | columna ciclo+hábitos */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-4 lg:space-y-0">
          {/* Columna izquierda */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-16" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full rounded-lg" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </CardContent>
            </Card>
          </div>

          {/* Columna derecha */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-14 rounded-lg" />
                  <Skeleton className="h-14 rounded-lg" />
                </div>
                <Skeleton className="h-4 w-48" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent className="space-y-1">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
