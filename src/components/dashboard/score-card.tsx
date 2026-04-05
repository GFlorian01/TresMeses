import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function ScoreCard({ score, label }: { score: number; label: string }) {
  const Icon = score >= 85 ? TrendingUp : score >= 70 ? Minus : TrendingDown;

  return (
    <Card className="card-hover overflow-hidden relative">
      {/* Gradient accent */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1",
          score >= 85 && "bg-gradient-to-r from-green-500 to-emerald-400",
          score >= 70 && score < 85 && "bg-gradient-to-r from-yellow-500 to-amber-400",
          score < 70 && "bg-gradient-to-r from-red-500 to-rose-400"
        )}
      />
      <CardContent className="pt-5 pb-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          {label}
        </p>
        <div className="flex items-end justify-between">
          <div>
            <span
              className={cn(
                "text-3xl font-bold tabular-nums",
                score >= 85 && "text-green-500",
                score >= 70 && score < 85 && "text-yellow-500",
                score < 70 && "text-red-500"
              )}
            >
              {score}
            </span>
            <span className="text-lg text-muted-foreground">%</span>
          </div>
          <div
            className={cn(
              "p-2 rounded-full",
              score >= 85 && "bg-green-500/10",
              score >= 70 && score < 85 && "bg-yellow-500/10",
              score < 70 && "bg-red-500/10"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4",
                score >= 85 && "text-green-500",
                score >= 70 && score < 85 && "text-yellow-500",
                score < 70 && "text-red-500"
              )}
            />
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          {score >= 85
            ? "Excelente ejecucion"
            : score >= 70
              ? "Puedes mejorar"
              : "Necesitas enfocarte"}
        </p>
      </CardContent>
    </Card>
  );
}
