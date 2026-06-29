import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, getScoreTier } from "@/lib/utils";
import { calculateDayScore } from "@/lib/dashboard-queries";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import type { DailyEntry, HabitCheck, MealEntry } from "@/types/database";

type EntryWithRelations = DailyEntry & {
  habit_checks: HabitCheck[];
  meal_entries: MealEntry[];
};

const dayLabels = ["L", "M", "X", "J", "V", "S", "D"];

const getScoreColor = (score: number) => getScoreTier(score).ring;

export function WeekCalendar({
  entries,
  weekStart,
  today,
  viewWeek,
  currentWeek,
}: {
  entries: EntryWithRelations[];
  weekStart: string;
  today: string;
  viewWeek: number;
  currentWeek: number;
}) {
  const start = new Date(weekStart);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const entry = entries.find((e) => e.date === dateStr);
    const score = entry ? calculateDayScore(entry) : -1;
    const isToday = dateStr === today;
    const isFuture = dateStr > today;

    const href = isFuture ? null : isToday ? "/check" : `/check?date=${dateStr}`;
    return { dateStr, day: d.getDate(), score, isToday, isFuture, label: dayLabels[i], href };
  });

  const isCurrentWeek = viewWeek === currentWeek;

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            {isCurrentWeek ? "Esta semana" : `Semana ${viewWeek}`}
          </div>
          <div className="flex items-center gap-1">
            <a
              href={viewWeek > 1 ? `/dashboard?week=${viewWeek - 1}` : undefined}
              className={cn(
                "p-1 rounded-md transition-colors",
                viewWeek > 1
                  ? "text-muted-foreground hover:text-foreground hover:bg-accent"
                  : "text-muted-foreground/30 pointer-events-none"
              )}
              aria-label="Semana anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </a>
            <a
              href={viewWeek < currentWeek ? `/dashboard?week=${viewWeek + 1}` : "/dashboard"}
              className={cn(
                "p-1 rounded-md transition-colors",
                viewWeek < currentWeek
                  ? "text-muted-foreground hover:text-foreground hover:bg-accent"
                  : "text-muted-foreground/30 pointer-events-none"
              )}
              aria-label="Semana siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {days.map((d) => (
            <div key={d.dateStr} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground">
                {d.label}
              </span>
              {d.href ? (
                <Link
                  href={d.href}
                  className={cn(
                    "w-10 h-10 rounded-xl flex flex-col items-center justify-center text-xs transition-all hover:scale-105 active:scale-95",
                    d.isToday && "ring-2 ring-primary",
                    d.score >= 0 && getScoreColor(d.score),
                    d.score === -1 && "bg-muted/50"
                  )}
                >
                  <span className="font-semibold text-[11px]">{d.day}</span>
                  {d.score >= 0 && (
                    <span className="text-[9px] opacity-80">{d.score}%</span>
                  )}
                </Link>
              ) : (
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex flex-col items-center justify-center text-xs",
                    "opacity-25 bg-muted"
                  )}
                >
                  <span className="font-semibold text-[11px]">{d.day}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
