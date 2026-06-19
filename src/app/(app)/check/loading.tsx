import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CheckLoading() {
  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      <div className="max-w-lg lg:max-w-4xl mx-auto p-4 lg:p-8 space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="pt-2 pb-1 flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="h-14 w-14 rounded-full" />
        </div>

        {/* Desktop: 2 columnas | Mobile: stack */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-4 lg:space-y-0">
          {/* Columna izquierda: rutina + entrenamiento */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <Skeleton className="h-1.5 w-full mt-2" />
              </CardHeader>
              <CardContent className="space-y-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-2 py-2.5">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-[72px] rounded-xl" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna derecha: comidas + lectura */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-2 py-2.5">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-8 w-16" />
                  <div className="flex gap-1.5">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-9 w-9 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
