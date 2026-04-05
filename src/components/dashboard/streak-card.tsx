import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export function StreakCard({ streak }: { streak: number }) {
  const isActive = streak > 0;

  return (
    <Card className="card-hover overflow-hidden relative">
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1",
          isActive
            ? "bg-gradient-to-r from-orange-500 to-amber-400"
            : "bg-muted"
        )}
      />
      <CardContent className="pt-5 pb-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Racha
        </p>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-3xl font-bold tabular-nums">{streak}</span>
            <span className="text-sm text-muted-foreground ml-1">
              {streak === 1 ? "dia" : "dias"}
            </span>
          </div>
          <div
            className={cn(
              "p-2 rounded-full",
              isActive ? "bg-orange-500/10" : "bg-muted"
            )}
          >
            <Flame
              className={cn(
                "h-4 w-4",
                isActive ? "text-orange-500" : "text-muted-foreground"
              )}
            />
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          {streak >= 7
            ? "Increible constancia"
            : streak >= 3
              ? "Buen ritmo, sigue asi"
              : isActive
                ? "Apenas empezando"
                : "Empieza hoy"}
        </p>
      </CardContent>
    </Card>
  );
}
