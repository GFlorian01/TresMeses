import { createClient } from "@/lib/supabase/server";
import {
  getWeekData,
  calculateWeekScore,
  getCycleProgress,
} from "@/lib/dashboard-queries";
import type { WeeklyReview } from "@/types/database";

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

export async function getReviewPageData(userId: string) {
  const cycleProgress = await getCycleProgress(userId);

  if (!cycleProgress) {
    return { hasCycle: false as const };
  }

  const { cycle, currentWeek } = cycleProgress;

  // Calcular el inicio de la semana actual del ciclo
  const weekStart = await getWeekStartForCycleWeek(
    cycle.start_date,
    currentWeek
  );

  // Datos de la semana
  const weekEntries = await getWeekData(userId, weekStart);
  const weekScore = calculateWeekScore(weekEntries);

  // Review existente
  const existingReview = await getWeeklyReview(cycle.id, currentWeek);

  // Todas las reviews anteriores
  const allReviews = await getAllReviews(cycle.id);

  return {
    hasCycle: true as const,
    cycle,
    currentWeek,
    weekScore,
    existingReview,
    allReviews,
    weekEntries,
  };
}
