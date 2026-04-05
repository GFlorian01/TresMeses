import { createClient } from "@/lib/supabase/server";
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

  // Hábitos
  entry.habit_checks.forEach((hc) => {
    total++;
    if (hc.completed) completed++;
  });

  // Comidas
  entry.meal_entries.forEach((me) => {
    total++;
    if (me.completed) completed++;
  });

  // Lectura (cuenta como 1 si leyó al menos 1 minuto)
  total++;
  if (entry.reading_minutes > 0) completed++;

  // Gym/Recuperación (cuenta como 1 si marcó alguno)
  total++;
  if (entry.is_gym_day || entry.is_recovery_day) completed++;

  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

// ─── Datos de la semana actual ───
export async function getWeekData(userId: string, weekStart: string) {
  const supabase = await createClient();

  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const { data: entries } = await supabase
    .from("daily_entries")
    .select("*, habit_checks(*), meal_entries(*)")
    .eq("user_id", userId)
    .gte("date", start.toISOString().split("T")[0])
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
export async function getStreak(userId: string): Promise<number> {
  const supabase = await createClient();

  // Traer los últimos 90 días de entries ordenados descendente
  const { data: entries } = await supabase
    .from("daily_entries")
    .select("date, habit_checks(*), meal_entries(*), is_gym_day, is_recovery_day, reading_minutes")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(90);

  if (!entries || entries.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 90; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split("T")[0];

    const entry = entries.find((e) => e.date === dateStr);
    if (!entry) break;

    const score = calculateDayScore(entry as DailyEntry & { habit_checks: HabitCheck[]; meal_entries: MealEntry[] });
    // Un día cuenta para la racha si el score es >= 70%
    if (score >= 70) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// ─── Progreso del ciclo ───
export async function getCycleProgress(userId: string) {
  const supabase = await createClient();

  const { data: cycle } = await supabase
    .from("cycles")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();

  if (!cycle) return null;

  const today = new Date();
  const start = new Date(cycle.start_date);
  const end = new Date(cycle.end_date);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.max(0, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const currentWeek = Math.min(12, Math.ceil(elapsedDays / 7));
  const progressPercent = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

  return {
    cycle,
    currentWeek,
    totalWeeks: 12,
    elapsedDays,
    totalDays,
    progressPercent,
  };
}

// ─── Sesiones de gym en las últimas 2 semanas ───
export async function getGymSessionsLast2Weeks(userId: string): Promise<number> {
  const supabase = await createClient();

  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 13);

  const { count } = await supabase
    .from("daily_entries")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_gym_day", true)
    .gte("date", twoWeeksAgo.toISOString().split("T")[0]);

  return count ?? 0;
}

// ─── Obtener lunes de la semana actual ───
export function getCurrentWeekStart(): string {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // lunes
  const monday = new Date(today);
  monday.setDate(diff);
  return monday.toISOString().split("T")[0];
}
