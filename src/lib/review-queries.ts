import { createClient } from "@/lib/supabase/server";
import {
  calculateWeekScore,
  calculateDayScore,
  getCycleProgress,
} from "@/lib/dashboard-queries";
import { getTodayStr, DEFAULT_TIMEZONE } from "@/lib/date-utils";
import type { WeeklyReview, DailyEntry, HabitCheck, MealEntry } from "@/types/database";

export async function getWeeklyReview(
  cycleId: string,
  weekNumber: number
): Promise<WeeklyReview | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("weekly_reviews")
    .select("*")
    .eq("cycle_id", cycleId)
    .eq("week_number", weekNumber)
    .single();

  return data;
}

export async function getAllReviews(cycleId: string): Promise<WeeklyReview[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("weekly_reviews")
    .select("*")
    .eq("cycle_id", cycleId)
    .order("week_number");

  return data ?? [];
}

export function getWeekStartForCycleWeek(
  cycleStartDate: string,
  weekNumber: number
): string {
  const start = new Date(cycleStartDate);
  start.setDate(start.getDate() + (weekNumber - 1) * 7);
  return start.toISOString().split("T")[0];
}

function getWeekEndStr(weekStart: string): string {
  const end = new Date(weekStart + "T12:00:00");
  end.setDate(end.getDate() + 6);
  return end.toISOString().split("T")[0];
}

export async function getReviewPageData(
  userId: string,
  requestedWeek?: number,
  tz: string = DEFAULT_TIMEZONE
) {
  const cycleProgress = await getCycleProgress(userId, tz);

  if (!cycleProgress) {
    return { hasCycle: false as const };
  }

  const { cycle, currentWeek } = cycleProgress;

  // Clamp requested week to valid range
  const viewWeek = requestedWeek
    ? Math.min(Math.max(1, requestedWeek), currentWeek)
    : currentWeek;

  // Fetch ALL daily entries for the cycle in a single query
  const supabase = await createClient();
  const { data: allEntries } = await supabase
    .from("daily_entries")
    .select("*, habit_checks(*), meal_entries(*)")
    .eq("user_id", userId)
    .gte("date", cycle.start_date)
    .lte("date", cycle.end_date)
    .order("date");

  const entries = (allEntries ?? []) as (DailyEntry & {
    habit_checks: HabitCheck[];
    meal_entries: MealEntry[];
  })[];

  // Compute per-week scores for all 12 weeks
  const weekScores = Array.from({ length: 12 }, (_, i) => {
    const w = i + 1;
    const weekStart = getWeekStartForCycleWeek(cycle.start_date, w);
    const weekEnd = getWeekEndStr(weekStart);
    const wEntries = entries.filter(e => e.date >= weekStart && e.date <= weekEnd);
    return {
      week: w,
      score: calculateWeekScore(wEntries),
      hasData: wEntries.length > 0,
    };
  });

  // Data for the viewed week
  const viewWeekStart = getWeekStartForCycleWeek(cycle.start_date, viewWeek);
  const viewWeekEnd = getWeekEndStr(viewWeekStart);
  const viewWeekEntries = entries.filter(
    e => e.date >= viewWeekStart && e.date <= viewWeekEnd
  );
  const weekScore = calculateWeekScore(viewWeekEntries);

  // 7-day grid for the viewed week (Mon–Sun)
  const dailyGrid = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(viewWeekStart + "T12:00:00");
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const entry = entries.find(e => e.date === dateStr);
    return {
      date: dateStr,
      score: entry ? calculateDayScore(entry) : null,
    };
  });

  // Reviews
  const [existingReview, allReviews] = await Promise.all([
    getWeeklyReview(cycle.id, viewWeek),
    getAllReviews(cycle.id),
  ]);

  // Sunday detection
  const todayStr = getTodayStr(tz);
  const isSunday = new Date(todayStr + "T12:00:00").getDay() === 0;

  return {
    hasCycle: true as const,
    cycle,
    currentWeek,
    viewWeek,
    weekScore,
    weekScores,
    dailyGrid,
    existingReview,
    allReviews,
    isSunday,
  };
}
