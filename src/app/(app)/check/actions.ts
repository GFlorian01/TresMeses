"use server";

import { createClient } from "@/lib/supabase/server";

export async function toggleHabit(checkId: string, completed: boolean) {
  const supabase = await createClient();
  await supabase
    .from("habit_checks")
    .update({ completed })
    .eq("id", checkId);
}

export async function updateMeal(
  entryId: string,
  completed: boolean,
  description?: string
) {
  const supabase = await createClient();
  await supabase
    .from("meal_entries")
    .update({ completed, ...(description !== undefined && { description }) })
    .eq("id", entryId);
}

export async function updateReadingMinutes(entryId: string, minutes: number) {
  const supabase = await createClient();
  await supabase
    .from("daily_entries")
    .update({ reading_minutes: minutes })
    .eq("id", entryId);
}

export async function toggleGymDay(
  entryId: string,
  isGym: boolean,
  isRecovery: boolean
) {
  const supabase = await createClient();
  await supabase
    .from("daily_entries")
    .update({ is_gym_day: isGym, is_recovery_day: isRecovery })
    .eq("id", entryId);
}

export async function updateNotes(entryId: string, notes: string) {
  const supabase = await createClient();
  await supabase
    .from("daily_entries")
    .update({ notes })
    .eq("id", entryId);
}
