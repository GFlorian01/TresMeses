import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { calculateDayScore } from "@/lib/dashboard-queries";
import { Calendar } from "lucide-react";
import type { DailyEntry, HabitCheck, MealEntry } from "@/types/database";

type EntryWithRelations = DailyEntry & {
  habit_checks: HabitCheck[];
  meal_entries: MealEntry[];
};

const dayLabels = ["L", "M", "X", "J", "V", "S", "D"];

function getScoreColor(score: number) {
  if (score >= 85) return "bg-green-500/20 text-green-400 ring-green-500/30";
  if (score >= 70) return "bg-yellow-500/20 text-yellow-400 ring-yellow-500/30";
  return "bg-red-500/20 text-red-400 ring-red-500/30";
}

export function WeekCalendar({
  entries,
  weekStart,
}: {
  entries: EntryWithRelations[];
  weekStart: string;
}) {
  const start = new Date(weekStart);
  const today = new Date().toISOString().split("T")[0];

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const entry = entries.find((e) => e.date === dateStr);
    const score = entry ? calculateDayScore(entry) : -1;
    const isToday = dateStr === today;
    const isFuture = dateStr > today;

    return { dateStr, day: d.getDate(), score, isToday, isFuture, label: dayLabels[i] };
  });

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Esta semana
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {days.map((d) => (
            <div key={d.dateStr} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground">
                {d.label}
              </span>
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex flex-col items-center justify-center text-xs transition-all",
                  d.isToday && "ring-2 ring-primary",
                  d.isFuture && "opacity-25 bg-muted",
                  !d.isFuture && d.score >= 0 && getScoreColor(d.score),
                  !d.isFuture && d.score === -1 && "bg-muted/50"
                )}
              >
                <span className="font-semibold text-[11px]">{d.day}</span>
                {!d.isFuture && d.score >= 0 && (
                  <span className="text-[9px] opacity-80">{d.score}%</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
