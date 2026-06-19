"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTodayStr, DEFAULT_TIMEZONE } from "@/lib/date-utils";

export async function completeOnboardingAction(data: {
  goals: string[];
  activeHabitIds: string[];
  customHabits: { name: string; icon: string }[];
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { goals, activeHabitIds, customHabits } = data;

  // 1. Queries iniciales en paralelo
  const [{ data: userRow }, { data: allHabits }, { data: topHabit }] = await Promise.all([
    supabase.from("users").select("timezone").eq("id", user.id).single(),
    supabase.from("habits").select("id").eq("user_id", user.id),
    supabase.from("habits").select("sort_order").eq("user_id", user.id).order("sort_order", { ascending: false }).limit(1),
  ]);

  const tz = userRow?.timezone ?? DEFAULT_TIMEZONE;
  const today = getTodayStr(tz);

  const toDeactivate = (allHabits ?? [])
    .filter((h) => !activeHabitIds.includes(h.id))
    .map((h) => h.id);
  const nextOrder = (topHabit?.[0]?.sort_order ?? 4) + 1;

  // 2. Hábitos + ciclo en paralelo (ciclo es idempotente: verifica antes de crear)
  await Promise.all([
    toDeactivate.length > 0
      ? supabase.from("habits").update({ is_active: false }).in("id", toDeactivate)
      : Promise.resolve(),
    customHabits.length > 0
      ? supabase.from("habits").insert(
          customHabits.map((h, i) => ({
            user_id: user.id,
            name: h.name,
            icon: h.icon || null,
            sort_order: nextOrder + i,
            is_active: true,
          }))
        )
      : Promise.resolve(),
    (async () => {
      // Idempotente: si ya existe un ciclo activo que empieza hoy, no crear otro
      const { data: existingCycle } = await supabase
        .from("cycles")
        .select("id")
        .eq("user_id", user.id)
        .eq("start_date", today)
        .eq("is_active", true)
        .single();

      if (!existingCycle) {
        await supabase
          .from("cycles")
          .update({ is_active: false })
          .eq("user_id", user.id)
          .eq("is_active", true);

        const endDate = new Date(today + "T12:00:00");
        endDate.setDate(endDate.getDate() + 83);

        await supabase.from("cycles").insert({
          user_id: user.id,
          start_date: today,
          end_date: endDate.toISOString().split("T")[0],
          goals,
        });
      }
    })(),
  ]);

  // 3. Marcar completo al final — si algo falló arriba, el usuario puede reintentar
  await supabase
    .from("users")
    .update({ onboarding_complete: true })
    .eq("id", user.id);

  redirect("/check");
}
