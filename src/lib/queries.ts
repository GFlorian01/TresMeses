import { createClient } from "@/lib/supabase/server";
import type {
  Habit,
  DailyEntry,
  HabitCheck,
  MealEntry,
  MealType,
  Cycle,
} from "@/types/database";

// ─── Usuario ───

export async function syncUser(supabaseUser: {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string; avatar_url?: string };
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: supabaseUser.user_metadata?.full_name ?? null,
        avatar_url: supabaseUser.user_metadata?.avatar_url ?? null,
      },
      { onConflict: "id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Ciclo ───

export async function getActiveCycle(userId: string): Promise<Cycle | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cycles")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();

  return data;
}

export async function createCycle(
  userId: string,
  startDate: string,
  goals: string[]
) {
  const supabase = await createClient();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 83); // 12 semanas - 1 día

  const { data, error } = await supabase
    .from("cycles")
    .insert({
      user_id: userId,
      start_date: startDate,
      end_date: endDate.toISOString().split("T")[0],
      goals,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Hábitos ───

export async function getHabits(userId: string): Promise<Habit[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

export async function createDefaultHabits(userId: string) {
  const supabase = await createClient();
  const defaults = [
    { name: "Tender cama", icon: "🛏️", sort_order: 0 },
    { name: "Estiramientos", icon: "🧘", sort_order: 1 },
    { name: "Abdominales", icon: "💪", sort_order: 2 },
    { name: "Skincare", icon: "🧴", sort_order: 3 },
    { name: "Desayuno", icon: "🍳", sort_order: 4 },
  ];

  const { error } = await supabase
    .from("habits")
    .insert(defaults.map((h) => ({ ...h, user_id: userId })));

  if (error) throw error;
}

// ─── Entrada diaria ───

export async function getDailyEntry(userId: string, date: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_entries")
    .select(
      `
      *,
      habit_checks(*, habit:habits(*)),
      meal_entries(*)
    `
    )
    .eq("user_id", userId)
    .eq("date", date)
    .single();

  return data;
}

export async function getOrCreateDailyEntry(userId: string, date: string) {
  const existing = await getDailyEntry(userId, date);
  if (existing) return existing;

  const supabase = await createClient();

  // Crear la entrada del día
  const { data: entry, error } = await supabase
    .from("daily_entries")
    .insert({ user_id: userId, date })
    .select()
    .single();

  if (error) throw error;

  // Crear habit checks para todos los hábitos activos
  const habits = await getHabits(userId);
  if (habits.length > 0) {
    await supabase.from("habit_checks").insert(
      habits.map((h) => ({
        daily_entry_id: entry.id,
        habit_id: h.id,
        completed: false,
      }))
    );
  }

  // Crear meal entries vacías
  const mealTypes: MealType[] = ["BREAKFAST", "LUNCH", "DINNER"];
  await supabase.from("meal_entries").insert(
    mealTypes.map((mt) => ({
      daily_entry_id: entry.id,
      meal_type: mt,
      completed: false,
    }))
  );

  return getDailyEntry(userId, date);
}

// ─── Updates ───

export async function toggleHabitCheck(checkId: string, completed: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("habit_checks")
    .update({ completed })
    .eq("id", checkId);

  if (error) throw error;
}

export async function updateMealEntry(
  entryId: string,
  data: { completed?: boolean; description?: string }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("meal_entries")
    .update(data)
    .eq("id", entryId);

  if (error) throw error;
}

export async function updateDailyEntry(
  entryId: string,
  data: Partial<
    Pick<
      DailyEntry,
      "is_gym_day" | "is_recovery_day" | "reading_minutes" | "notes"
    >
  >
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("daily_entries")
    .update(data)
    .eq("id", entryId);

  if (error) throw error;
}
