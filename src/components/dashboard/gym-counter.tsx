import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

export function GymCounter({ sessions }: { sessions: number }) {
  const target = 6;
  const onTrack = sessions >= target;
  const percent = Math.min(100, Math.round((sessions / target) * 100));

  return (
    <Card className="card-hover overflow-hidden relative">
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1",
          onTrack
            ? "bg-gradient-to-r from-green-500 to-emerald-400"
            : "bg-gradient-to-r from-red-500 to-orange-400"
        )}
      />
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground">
            Gym — ultimas 2 semanas
          </p>
          <div
            className={cn(
              "p-2 rounded-full",
              onTrack ? "bg-green-500/10" : "bg-red-500/10"
            )}
          >
            <Dumbbell
              className={cn(
                "h-4 w-4",
                onTrack ? "text-green-500" : "text-red-500"
              )}
            />
          </div>
        </div>

        {/* Visual dots */}
        <div className="flex gap-2 mb-2">
          {Array.from({ length: target }, (_, i) => (
            <div
              key={i}
              className={cn(
                "h-3 flex-1 rounded-full transition-colors",
                i < sessions
                  ? onTrack
                    ? "bg-green-500"
                    : "bg-red-500"
                  : "bg-muted"
              )}
            />
          ))}
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold tabular-nums">{sessions}</span>
            <span className="text-sm text-muted-foreground"> / {target}</span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {onTrack ? "Meta cumplida" : `Faltan ${target - sessions}`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
