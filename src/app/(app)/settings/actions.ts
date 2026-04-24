"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createCycleAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const startDate = formData.get("startDate") as string;
  const goalsRaw = formData.get("goals") as string;
  const goals = goalsRaw
    .split("\n")
    .map((g) => g.trim())
    .filter(Boolean);

  // Desactivar ciclos anteriores
  await supabase
    .from("cycles")
    .update({ is_active: false })
    .eq("user_id", user.id)
    .eq("is_active", true);

  // Crear nuevo ciclo
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 83);

  const { error } = await supabase.from("cycles").insert({
    user_id: user.id,
    start_date: startDate,
    end_date: endDate.toISOString().split("T")[0],
    goals,
  });

  if (error) throw error;
  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

export async function addHabitAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = formData.get("name") as string;
  const icon = (formData.get("icon") as string) || null;

  // Obtener el mayor sort_order
  const { data: habits } = await supabase
    .from("habits")
    .select("sort_order")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = habits && habits.length > 0 ? habits[0].sort_order + 1 : 0;

  const { error } = await supabase.from("habits").insert({
    user_id: user.id,
    name,
    icon,
    sort_order: nextOrder,
  });

  if (error) throw error;
  revalidatePath("/settings");
}

export async function toggleHabitActive(habitId: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("habits")
    .update({ is_active: isActive })
    .eq("id", habitId);

  if (error) throw error;
  revalidatePath("/settings");
}

export async function updateNameAction(name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.auth.updateUser({ data: { full_name: name } });
  await supabase.from("users").update({ name }).eq("id", user.id);

  revalidatePath("/settings");
  revalidatePath("/check");
}

export async function updateTimezoneAction(timezone: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("users").update({ timezone }).eq("id", user.id);
  revalidatePath("/settings");
  revalidatePath("/check");
  revalidatePath("/dashboard");
}

export async function pauseCycleAction(reason: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("cycles")
    .update({
      is_paused: true,
      paused_at: new Date().toISOString(),
      pause_reason: reason,
    })
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (error) throw error;
  revalidatePath("/settings");
  revalidatePath("/check");
  revalidatePath("/dashboard");
  revalidatePath("/review");
}

export async function resumeCycleAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: cycle } = await supabase
    .from("cycles")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .eq("is_paused", true)
    .single();

  if (!cycle) throw new Error("No paused cycle found");

  const pausedAt = new Date(cycle.paused_at);
  const now = new Date();
  const daysPaused = Math.ceil((now.getTime() - pausedAt.getTime()) / (1000 * 60 * 60 * 24));
  const newTotalPausedDays = (cycle.total_paused_days ?? 0) + daysPaused;

  const endDate = new Date(cycle.end_date + "T12:00:00");
  endDate.setDate(endDate.getDate() + daysPaused);

  const { error } = await supabase
    .from("cycles")
    .update({
      is_paused: false,
      paused_at: null,
      total_paused_days: newTotalPausedDays,
      end_date: endDate.toISOString().split("T")[0],
    })
    .eq("id", cycle.id);

  if (error) throw error;
  revalidatePath("/settings");
  revalidatePath("/check");
  revalidatePath("/dashboard");
  revalidatePath("/review");
}

export async function restartCycleAction(reason: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("cycles")
    .update({
      is_active: false,
      is_paused: false,
      restart_reason: reason,
    })
    .eq("user_id", user.id)
    .eq("is_active", true);

  revalidatePath("/settings");
  revalidatePath("/check");
  revalidatePath("/dashboard");
  revalidatePath("/review");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
