"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function requireUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user;
}

export async function createCycleAction(formData: FormData) {
  const supabase = await createClient();
  const user = await requireUser(supabase);

  const startDate = formData.get("startDate") as string;
  const goals = (formData.get("goals") as string)
    .split("\n")
    .map((g) => g.trim())
    .filter(Boolean);

  await supabase.from("cycles").update({ is_active: false }).eq("user_id", user.id).eq("is_active", true);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 83);

  const { error } = await supabase.from("cycles").insert({
    user_id: user.id,
    start_date: startDate,
    end_date: endDate.toISOString().split("T")[0],
    goals,
  });

  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function addHabitAction(formData: FormData) {
  const supabase = await createClient();
  const user = await requireUser(supabase);

  const name = formData.get("name") as string;
  const icon = (formData.get("icon") as string) || null;

  const { data: habits } = await supabase
    .from("habits")
    .select("sort_order")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = habits && habits.length > 0 ? habits[0].sort_order + 1 : 0;

  const { error } = await supabase.from("habits").insert({ user_id: user.id, name, icon, sort_order: nextOrder });
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function toggleHabitActive(habitId: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("habits").update({ is_active: isActive }).eq("id", habitId);
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function updateNameAction(name: string) {
  const supabase = await createClient();
  const user = await requireUser(supabase);
  const { error } = await supabase.from("users").update({ name }).eq("id", user.id);
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function updateTimezoneAction(timezone: string) {
  const supabase = await createClient();
  const user = await requireUser(supabase);
  await supabase.from("users").update({ timezone }).eq("id", user.id);
  revalidatePath("/", "layout");
}

export async function pauseCycleAction(reason: string) {
  const supabase = await createClient();
  const user = await requireUser(supabase);

  const { error } = await supabase
    .from("cycles")
    .update({ is_paused: true, paused_at: new Date().toISOString(), pause_reason: reason })
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function resumeCycleAction() {
  const supabase = await createClient();
  const user = await requireUser(supabase);

  const { data: cycle } = await supabase
    .from("cycles")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .eq("is_paused", true)
    .single();

  if (!cycle) throw new Error("No paused cycle found");

  const daysPaused = Math.ceil((Date.now() - new Date(cycle.paused_at).getTime()) / 86400000);
  const endDate = new Date(cycle.end_date + "T12:00:00");
  endDate.setDate(endDate.getDate() + daysPaused);

  const { error } = await supabase
    .from("cycles")
    .update({
      is_paused: false,
      paused_at: null,
      total_paused_days: (cycle.total_paused_days ?? 0) + daysPaused,
      end_date: endDate.toISOString().split("T")[0],
    })
    .eq("id", cycle.id);

  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function restartCycleAction(reason: string) {
  const supabase = await createClient();
  const user = await requireUser(supabase);

  await supabase
    .from("cycles")
    .update({ is_active: false, is_paused: false, restart_reason: reason })
    .eq("user_id", user.id)
    .eq("is_active", true);

  revalidatePath("/", "layout");
}

export async function saveEmailPrefsAction(data: {
  morning_enabled: boolean;
  morning_time: string;
  evening_enabled: boolean;
  evening_time: string;
  weekly_enabled: boolean;
  weekly_time: string;
}) {
  const supabase = await createClient();
  const user = await requireUser(supabase);

  const toTime = (t: string) => (t.length === 5 ? `${t}:00` : t);

  await supabase.from("email_preferences").upsert(
    {
      user_id: user.id,
      morning_enabled: data.morning_enabled,
      morning_time: toTime(data.morning_time),
      evening_enabled: data.evening_enabled,
      evening_time: toTime(data.evening_time),
      weekly_enabled: data.weekly_enabled,
      weekly_time: toTime(data.weekly_time),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  revalidatePath("/", "layout");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
