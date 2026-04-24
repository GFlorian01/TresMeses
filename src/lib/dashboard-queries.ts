import { createClient } from "@/lib/supabase/server";
import { getTodayStr, getWeekStartStr, getDaysAgoStr, DEFAULT_TIMEZONE } from "@/lib/date-utils";
import type { DailyEntry, HabitCheck, MealEntry } from "@/types/database";

// ─── Score de un día ───
export function calculateDayScore(
  entry: DailyEntry & {
    habit_checks: HabitCheck[];
    meal_entries: MealEntry[];
  }
): number {
  let total = 0;
  let completed = 0;

  entry.habit_checks.forEach((hc) => {
    total++;
    if (hc.completed) completed++;
  });

  entry.meal_entries.forEach((me) => {
    total++;
    if (me.completed) completed++;
  });

  total++;
  if (entry.reading_minutes > 0) completed++;

  total++;
  if (entry.is_gym_day || entry.is_recovery_day) completed++;

  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

// ─── Datos de la semana actual ───
export async function getWeekData(userId: string, weekStart: string, cycleStartDate?: string) {
  const supabase = await createClient();

  const start = new Date(weekStart + "T12:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  // Only show entries from the current cycle onwards
  const minDate = cycleStartDate && cycleStartDate > start.toISOString().split("T")[0]
    ? cycleStartDate
    : start.toISOString().split("T")[0];

  const { data: entries } = await supabase
    .from("daily_entries")
    .select("*, habit_checks(*), meal_entries(*)")
    .eq("user_id", userId)
    .gte("date", minDate)
    .lte("date", end.toISOString().split("T")[0])
    .order("date");

  return entries ?? [];
}

// ─── Score semanal promedio ───
export function calculateWeekScore(
  entries: (DailyEntry & {
    habit_checks: HabitCheck[];
    meal_entries: MealEntry[];
  })[]
): number {
  if (entries.length === 0) return 0;
  const total = entries.reduce((sum, e) => sum + calculateDayScore(e), 0);
  return Math.round(total / entries.length);
}

// ─── Racha de días consecutivos ───
export async function getStreak(
  userId: string,
  tz: string = DEFAULT_TIMEZONE,
  cycleStartDate?: string
): Promise<number> {
  const supabase = await createClient();

  let query = supabase
    .from("daily_entries")
    .select("date, habit_checks(*), meal_entries(*), is_gym_day, is_recovery_day, reading_minutes")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(90);

  if (cycleStartDate) {
    query = query.gte("date", cycleStartDate);
  }

  const { data: entries } = await query;

  if (!entries || entries.length === 0) return 0;

  let streak = 0;
  for (let i = 0; i < 90; i++) {
    const dateStr = getDaysAgoStr(i, tz);
    // Stop counting if we've gone before the cycle start
    if (cycleStartDate && dateStr < cycleStartDate) break;
    const entry = entries.find((e) => e.date === dateStr);
    if (!entry) break;

    const score = calculateDayScore(
      entry as DailyEntry & { habit_checks: HabitCheck[]; meal_entries: MealEntry[] }
    );
    if (score >= 70) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// ─── Progreso del ciclo ───
export async function getCycleProgress(
  userId: string,
  tz: string = DEFAULT_TIMEZONE
) {
  const supabase = await createClient();

  const { data: cycle } = await supabase
    .from("cycles")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();

  if (!cycle) return null;

  const todayStr = getTodayStr(tz);
  const today = new Date(todayStr + "T12:00:00");
  const start = new Date(cycle.start_date + "T12:00:00");
  const end = new Date(cycle.end_date + "T12:00:00");
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.max(0, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const currentWeek = Math.min(12, Math.ceil(elapsedDays / 7) || 1);
  const progressPercent = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

  return { cycle, currentWeek, totalWeeks: 12, elapsedDays, totalDays, progressPercent };
}

// ─── Sesiones de gym en las últimas 2 semanas ───
export async function getGymSessionsLast2Weeks(
  userId: string,
  tz: string = DEFAULT_TIMEZONE,
  cycleStartDate?: string
): Promise<number> {
  const supabase = await createClient();
  const twoWeeksAgoStr = getDaysAgoStr(13, tz);

  // Use the later of twoWeeksAgo or cycleStartDate so old cycles don't bleed in
  const minDate = cycleStartDate && cycleStartDate > twoWeeksAgoStr
    ? cycleStartDate
    : twoWeeksAgoStr;

  const { count } = await supabase
    .from("daily_entries")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_gym_day", true)
    .gte("date", minDate);

  return count ?? 0;
}

// ─── Obtener lunes de la semana actual ───
export function getCurrentWeekStart(tz: string = DEFAULT_TIMEZONE): string {
  return getWeekStartStr(tz);
}

// ─── Obtener hoy ───
export function getToday(tz: string = DEFAULT_TIMEZONE): string {
  return getTodayStr(tz);
}
