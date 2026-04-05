import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface CycleProgressProps {
  currentWeek: number;
  totalWeeks: number;
  progressPercent: number;
  goals: string[];
}

export function CycleProgress({
  currentWeek,
  totalWeeks,
  progressPercent,
  goals,
}: CycleProgressProps) {
  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Ciclo de 12 semanas
          </span>
          <Badge variant="secondary" className="text-[10px] font-medium">
            Semana {currentWeek}/{totalWeeks}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Week dots */}
        <div className="flex gap-1">
          {Array.from({ length: totalWeeks }, (_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 flex-1 rounded-full transition-colors",
                i + 1 < currentWeek && "bg-primary",
                i + 1 === currentWeek && "bg-primary animate-pulse",
                i + 1 > currentWeek && "bg-muted"
              )}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {progressPercent}% del ciclo completado
        </p>

        {goals.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {goals.map((goal, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-xs"
              >
                <span className="text-primary mt-0.5">●</span>
                <span className="text-muted-foreground">{goal}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
