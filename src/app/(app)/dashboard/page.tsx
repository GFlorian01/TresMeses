import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getWeekData,
  calculateWeekScore,
  getStreak,
  getCycleProgress,
  getGymSessionsLast2Weeks,
  getCurrentWeekStart,
} from "@/lib/dashboard-queries";
import { DEFAULT_TIMEZONE, getTodayStr } from "@/lib/date-utils";
import { ScoreCard } from "@/components/dashboard/score-card";
import { StreakCard } from "@/components/dashboard/streak-card";
import { CycleProgress } from "@/components/dashboard/cycle-progress";
import { WeekCalendar } from "@/components/dashboard/week-calendar";
import { GymCounter } from "@/components/dashboard/gym-counter";
import { BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: userRow } = await supabase
    .from("users")
    .select("timezone")
    .eq("id", user.id)
    .single();
  const tz = userRow?.timezone ?? DEFAULT_TIMEZONE;

  const weekStart = getCurrentWeekStart(tz);

  const cycleProgress = await getCycleProgress(user.id, tz);
  const cycleStart = cycleProgress?.cycle.start_date;

  const [weekEntries, streak, gymSessions] = await Promise.all([
    getWeekData(user.id, weekStart, cycleStart),
    getStreak(user.id, tz, cycleStart),
    getGymSessionsLast2Weeks(user.id, tz, cycleStart),
  ]);

  const weekScore = calculateWeekScore(weekEntries);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <div className="flex items-center gap-2 pt-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
        </div>

        {/* Score y Racha */}
        <div className="grid grid-cols-2 gap-3">
          <ScoreCard score={weekScore} label="Score semanal" />
          <StreakCard streak={streak} />
        </div>

        {/* Calendario semanal */}
        <WeekCalendar entries={weekEntries} weekStart={weekStart} today={getTodayStr(tz)} />

        {/* Gym counter */}
        <GymCounter sessions={gymSessions} />

        {/* Progreso del ciclo */}
        {cycleProgress ? (
          <CycleProgress
            currentWeek={cycleProgress.currentWeek}
            totalWeeks={cycleProgress.totalWeeks}
            progressPercent={cycleProgress.progressPercent}
            goals={cycleProgress.cycle.goals}
          />
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No tienes un ciclo activo.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ve a <span className="text-primary font-medium">Config</span> para crear uno.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
